import { Segment as Segment1, Version as Version1 } from "@ndn/naming-convention1";
import { Segment2, Segment3, Version2, Version3 } from "@ndn/naming-convention2";
import { FwHint, Name } from "@ndn/packet";
import { discoverVersion, fetch, RttEstimator, TcpCubic } from "@ndn/segmented-object";
import { toHex } from "@ndn/util";
import hirestime from "hirestime";
import * as log from "loglevel";
import DefaultMap from "mnemonist/default-map.js";
import PQueue from "p-queue";
import shaka from "shaka-player";

import { sendBeacon } from "./connect.js";

/** @type {Array<[Name, FwHint]>} */
const fwHints = [];

/**
 * Update forwarding hint mapping.
 * @param {Record<string, string> | undefined} m
 */
export function updateFwHints(m = {}) {
  fwHints.splice(0, Infinity);
  for (const [prefix, fh] of Object.entries(m)) {
    fwHints.push([new Name(prefix), new FwHint(fh)]);
  }
  fwHints.sort((a, b) => b[0].length - a[0].length);
}

/**
 * Determine forwarding hint for Interest.
 * @param {Name} name
 * @returns {import("@ndn/packet").Interest.ModifyFields | undefined}
 */
function findFwHint(name) {
  for (const [prefix, fwHint] of fwHints) {
    if (prefix.isPrefixOf(name)) {
      return { fwHint };
    }
  }
  return undefined;
}

const getNow = hirestime();

/** @type {import("@ndn/packet").NamingConvention<number>} */
let segmentNumConvention;

/** @type {import("@ndn/packet").Component} */
let versionComponent;

/** @type {PQueue} */
let queue;

/** @type {RttEstimator} */
let rtte;

/** @type {TcpCubic} */
let ca;

/** @type {DefaultMap<string, number>} */
let estimatedCounts;

/**
 * shaka.extern.SchemePlugin for ndn: scheme.
 * @param {string} uri
 */
export function NdnPlugin(uri, request, requestType) {
  const name = new Name(uri.replace(/^ndn:/, ""));
  const modifyInterest = findFwHint(name);
  const estimatedCountKey = toHex(name.getPrefix(-2).value);
  const estimatedFinalSegNum = estimatedCounts.get(estimatedCountKey);

  const abort = new AbortController();
  /** @type {fetch.Result} */
  let fetchResult;

  const t0 = getNow();
  let t1 = 0;
  log.debug(`NdnPlugin.request ${name} queued=${queue.size}`);
  return new shaka.util.AbortableOperation(
    queue.add(async () => {
      t1 = getNow();
      log.debug(`NdnPlugin.fetch ${name} waited=${Math.round(t1 - t0)}`);

      if (!segmentNumConvention) {
        const versioned = await discoverVersion(name, {
          conventions: [
            [Version3, Segment3],
            [Version2, Segment2],
            [Version1, Segment1],
          ],
          modifyInterest,
          signal: abort.signal,
        });
        versionComponent = versioned.get(-1);
        segmentNumConvention = versioned.segmentNumConvention;
        log.info(`NdnPlugin.discoverVersion version=${versioned.versionConvention.parse(versionComponent)}`);
        t1 = getNow();
      }

      fetchResult = fetch(name.append(versionComponent), {
        rtte,
        ca,
        retxLimit: 4,
        segmentNumConvention,
        modifyInterest,
        estimatedFinalSegNum,
        signal: abort.signal,
      });
      return fetchResult;
    }).then(
      (payload) => {
        const timeMs = getNow() - t1;
        estimatedCounts.set(estimatedCountKey, fetchResult.count);
        log.debug(`NdnPlugin.response ${name} rtt=${Math.round(timeMs)} count=${fetchResult.count}`);
        sendBeacon({
          a: "F",
          n: name.toString(),
          d: Math.round(timeMs),
          sRtt: Math.round(rtte.sRtt),
          rto: Math.round(rtte.rto),
          cwnd: Math.round(ca.cwnd),
        });
        return {
          uri,
          originalUri: uri,
          data: payload,
          headers: {},
          timeMs,
        };
      },
      (err) => {
        if (abort.signal.aborted) {
          log.debug(`NdnPlugin.abort ${name}`);
          return shaka.util.AbortableOperation.aborted();
        }
        log.warn(`NdnPlugin.error ${name} ${err}`);
        sendBeacon({
          a: "E",
          n: name.toString(),
          err: err.toString(),
        });
        throw new shaka.util.Error(
          shaka.util.Error.Severity.RECOVERABLE,
          shaka.util.Error.Category.NETWORK,
          shaka.util.Error.Code.BAD_HTTP_STATUS,
          uri, 503, null, {}, requestType);
      },
    ),
    async () => abort.abort(),
  );
}

NdnPlugin.reset = () => {
  segmentNumConvention = undefined;
  versionComponent = undefined;
  queue = new PQueue({ concurrency: 4 });
  rtte = new RttEstimator({ maxRto: 10000 });
  ca = new TcpCubic({ c: 0.1 });
  estimatedCounts = new DefaultMap(() => 5);
};

NdnPlugin.getInternals = () => ({ queue, rtte, ca });

NdnPlugin.reset();
