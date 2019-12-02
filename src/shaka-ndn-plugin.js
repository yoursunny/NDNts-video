import { Segment as Segment1, Version as Version1 } from "@ndn/naming-convention1";
import { Name } from "@ndn/packet";
import { fetch, LimitedCwnd, RttEstimator, TcpCubic } from "@ndn/segmented-object";
import hirestime from "hirestime";
import * as log from "loglevel";
import PQueue from "p-queue";
import shaka from "shaka-player";

const getNow = hirestime();
const queue = new PQueue({ concurrency: 1 });

const rtte = new RttEstimator({ maxRto: 10000 });

/**
 * shaka.extern.SchemePlugin for ndn: scheme.
 * @param {string} uri
 */
export function NdnPlugin(uri, request, requestType) {
  const name = new Name(uri.replace(/^ndn:/, "")).append(Version1, 1);
  const abort = new AbortController();
  let t0 = 0;
  return new shaka.util.AbortableOperation(
    queue.add(() => {
      log.debug(`NdnPlugin.fetch ${name}`);
      t0 = getNow();
      return fetch.promise(name, {
        rtte,
        ca: new LimitedCwnd(new TcpCubic(), 8),
        retxLimit: 4,
        segmentNumConvention: Segment1,
        abort,
      });
    }).then(
      (payload) => {
        const timeMs = getNow() - t0;
        log.debug(`NdnPlugin.response ${name} ${timeMs}`);
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
