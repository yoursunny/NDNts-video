import { get as hashGet, set as hashSet } from "hashquery";
import * as log from "loglevel";
import shaka from "shaka-player";

import { connect } from "./connect.js";
import { NdnPlugin } from "./shaka-ndn-plugin.js";

async function main() {
  const $loglevel = document.querySelector("#loglevel");
  $loglevel.addEventListener("change", (evt) => {
    log.setLevel(evt.target.selectedIndex);
  });
  $loglevel.selectedIndex = log.getLevel();

  document.querySelector("#router").textContent = await connect();

  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) {
    return;
  }
  shaka.net.NetworkingEngine.registerScheme("ndn", NdnPlugin);

  document.querySelectorAll("#catalog a")
    .forEach((a) => a.addEventListener("click", selectTitle));

  const initialVideo = hashGet("video");
  if (initialVideo) {
    play(initialVideo);
  }
}

/**
 * Select a video title from list and start playing.
 * @param {MouseEvent} evt
 */
function selectTitle(evt) {
  const manifest = evt.target.getAttribute("data-manifest");
  play(manifest, evt.target.textContent);
}

let player;

function setupPlayer() {
  if (player) { return; }
  player = new shaka.Player(document.querySelector("#video"));
  player.configure({
    streaming: {
      useNativeHlsOnSafari: false,
      bufferingGoal: 20,
      bufferBehind: 20,
      retryParameters: {
        maxAttempts: 5,
        timeout: 0,
      },
    },
  });

  setInterval(showStats, 200);
}

/**
 * Start playing an URI.
 * @param {string} manifest
 * @param {string|undefined} title
 */
function play(manifest, title) {
  hashSet("video", manifest);
  document.title = title || "NDN Video Player";
  setupPlayer();
  NdnPlugin.reset();
  player.load(`ndn:${manifest}`).catch((err) => log.error(`${err}`));
}

function showStats() {
  const {
    width,
    height,
    streamBandwidth,
    decodedFrames,
    droppedFrames,
    estimatedBandwidth,
    loadLatency,
  } = player.getStats();
  document.querySelector("#stat_resolution").textContent = `${width}x${height} ${Math.round(streamBandwidth / 1024)} Kbps`;
  document.querySelector("#stat_bw").textContent = `${Math.round(estimatedBandwidth / 1024)} Kbps`;
  document.querySelector("#stat_frames").textContent = `${decodedFrames} decoded, ${droppedFrames} dropped`;
  document.querySelector("#stat_latency").textContent = `${Math.round(loadLatency * 1000)} ms`;

  const {
    rtte: { sRtt, rto },
    ca: { cwnd, wMax, ssthresh },
  } = NdnPlugin.getInternals();
  document.querySelector("#stat_rtt").textContent = `srtt ${Math.round(sRtt)} ms, rto ${Math.round(rto)} ms`;
  document.querySelector("#stat_cubic").textContent = `cwnd ${Math.round(cwnd)}, wMax ${Math.round(wMax)}, ssthresh ${Math.round(ssthresh)}`;
}

document.addEventListener("DOMContentLoaded", main);
