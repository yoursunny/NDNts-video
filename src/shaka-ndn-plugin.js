import { Segment as Segment1, Version as Version1 } from "@ndn/naming-convention1";
import { Name } from "@ndn/packet";
import { fetch, RttEstimator, TcpCubic } from "@ndn/segmented-object";
import { toHex } from "@ndn/tlv";
import hirestime from "hirestime";
import * as log from "loglevel";
import PQueue from "p-queue";
import shaka from "shaka-player";

const getNow = hirestime();

/** @type {PQueue} */
let queue;

/** @type {RttEstimator} */
let rtte;

/** @type {TcpCubic} */
let ca;

/** @type {Map<string, number>} */
let estimatedCounts;

/**
 * shaka.extern.SchemePlugin for ndn: scheme.
 * @param {string} uri
 */
export function NdnPlugin(uri, request, requestType) {
  const name = new Name(uri.replace(/^ndn:/, "")).append(Version1, 1);
  const estimatedCountKey = toHex(name.getPrefix(-2).value);
  const estimatedFinalSegNum = estimatedCounts.get(estimatedCountKey) || 5;

  const abort = new AbortController();
  /** @type {fetch.Result} */
  let fetchResult;

  const t0 = getNow();
  let t1 = 0;
  log.debug(`NdnPlugin.request ${name} queued=${queue.size}`);
  return new shaka.util.AbortableOperation(
    queue.add(() => {
      t1 = getNow();
      log.debug(`NdnPlugin.fetch ${name} waited=${Math.round(t1 - t0)}`);
      fetchResult = fetch(name, {
        rtte,
        ca,
        retxLimit: 4,
        segmentNumConvention: Segment1,
        estimatedFinalSegNum,
        abort,
      });
      return fetchResult;
    }).then(
      (payload) => {
        const timeMs = getNow() - t1;
        estimatedCounts.set(estimatedCountKey, fetchResult.count);
        log.debug(`NdnPlugin.response ${name} rtt=${Math.round(timeMs)} count=${fetchResult.count}`);
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
  queue = new PQueue({ concurrency: 4 });
  rtte = new RttEstimator({ maxRto: 10000 });
  ca = new TcpCubic({
    c: 0.04,
  });
  estimatedCounts = new Map();
};

NdnPlugin.getInternals = () => {
  return { queue, rtte, ca };
};

NdnPlugin.reset();
