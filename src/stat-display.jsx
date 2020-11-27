import { el } from "redom";

import { remote } from "./connect.js";

export class StatDisplay {
  constructor() {
    <div this="el" class="stat">
      <h3>Playback Statistics</h3>
      <ul>
        <li>router: <span this="$remote" style="word-break:break-all;"/></li>
        <li>resolution: <span this="$resolution"/></li>
        <li>bandwidth: <span this="$bw"/></li>
        <li>frames: <span this="$frames"/></li>
        <li>latency: <span this="$latency"/></li>
        <li>rtt: <span this="$rtt"/></li>
        <li>cubic: <span this="$cubic"/></li>
      </ul>
    </div>;
  }

  update({ playerStats, ndnInternals }) {
    const {
      width,
      height,
      streamBandwidth,
      decodedFrames,
      droppedFrames,
      estimatedBandwidth,
      loadLatency,
    } = playerStats;
    const {
      rtte: { sRtt, rto },
      ca: { cwnd, wMax, ssthresh },
    } = ndnInternals;

    this.$remote.textContent = remote ?? "not connected";

    this.$resolution.textContent = `${formatInt(width)}x${formatInt(height)} ${formatInt(streamBandwidth / 1024)} Kbps`;
    this.$bw.textContent = `${formatInt(estimatedBandwidth / 1024)} Kbps`;
    this.$frames.textContent = `${formatInt(decodedFrames)} decoded, ${formatInt(droppedFrames)} dropped`;
    this.$latency.textContent = `${formatInt(loadLatency * 1000)} ms`;

    this.$rtt.textContent = `srtt ${formatInt(sRtt)} ms, rto ${formatInt(rto)} ms`;
    this.$cubic.textContent = `cwnd ${formatInt(cwnd)}, wMax ${formatInt(wMax)}, ssthresh ${formatInt(ssthresh)}`;
  }
}

/**
 * @param {number} n
 * @returns {string}
 */
function formatInt(n) {
  return Number.isNaN(n) ? "?" : `${Math.round(n)}`;
}
