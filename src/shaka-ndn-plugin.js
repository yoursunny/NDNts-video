import { Segment as Segment1, Version as Version1 } from "@ndn/naming-convention1";
import { Segment as Segment2, Version as Version2 } from "@ndn/naming-convention2";
import { FwHint, Name } from "@ndn/packet";
import { discoverVersion, fetch, RttEstimator, TcpCubic } from "@ndn/segmented-object";
import { toHex } from "@ndn/tlv";
import hirestime from "hirestime";
import * as log from "loglevel";
import DefaultMap from "mnemonist/default-map.js";
import PQueue from "p-queue";
import shaka from "shaka-player";

import { sendBeacon } from "./connect.js";

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

const ndnWebVideoPrefix = new Name("/ndn/web/video");
const yoursunnyFwHint = new FwHint([new FwHint.Delegation("/yoursunny")]);

/**
 * shaka.extern.SchemePlugin for ndn: scheme.
 * @param {string} uri
 */
export function NdnPlugin(uri, request, requestType) {
  const name = new Name(uri.replace(/^ndn:/, ""));
  const estimatedCountKey = toHex(name.getPrefix(-2).value);
  const estimatedFinalSegNum = estimatedCounts.get(estimatedCountKey);
  /** @type {import("@ndn/packet").Interest.ModifyFields | undefined} */
  const modifyInterest = ndnWebVideoPrefix.isPrefixOf(name) ? { fwHint: yoursunnyFwHint } : undefined;

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
        const errs = [];
        for (const { convention, Version, Segment } of [
          { convention: 2, Version: Version2, Segment: Segment2 },
          { convention: 1, Version: Version1, Segment: Segment1 },
        ]) {
          try {
            const versioned = await discoverVersion(name, {
              versionConvention: Version,
              segmentNumConvention: Segment,
              modifyInterest,
              signal: abort.signal,
            });
            versionComponent = versioned.get(-1);
            segmentNumConvention = Segment;
            log.info(`NdnPlugin.discoverVersion convention=${convention} version=${Version.parse(versionComponent)}`);
          } catch (err) {
            errs.push(err);
          }
        }
        if (!segmentNumConvention) {
          throw new Error(`discoverVersion failed\n${errs.join("\n")}`);
        }
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

NdnPlugin.getInternals = () => {
  return { queue, rtte, ca };
};

NdnPlugin.reset();
