import { connectToTestbed } from "@ndn/autoconfig";
import { Name } from "@ndn/packet";
import * as log from "loglevel";
import shaka from "shaka-player";

import { NdnPlugin } from "./shaka-ndn-plugin";

async function connect() {
  const faces = await connectToTestbed({
    count: 4,
    preferFastest: true,
  });
  if (faces.length === 0) {
    throw new Error("unable to connect to NDN testbed");
  }
  faces[0].addRoute(new Name("/"));
  return faces[0].toString();
}

async function main() {
  const loglevelSelect = document.querySelector("#loglevel");
  loglevelSelect.addEventListener("change", (evt) => {
    log.setLevel(evt.target.selectedIndex);
  });
  loglevelSelect.selectedIndex = log.getLevel();

  await connect();

  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) {
    return;
  }
  shaka.net.NetworkingEngine.registerScheme("ndn", NdnPlugin);

  document.querySelectorAll("#catalog a")
    .forEach((a) => a.addEventListener("click", play));
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

function play(evt) {
  setupPlayer();
  NdnPlugin.reset();
  document.title = evt.target.textContent;
  const manifest = evt.target.getAttribute("data-manifest");
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
