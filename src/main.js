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
  if (faces.length < 1) {
    throw new Error("unable to connect to NDN testbed");
  }
  faces[0].addRoute(new Name("/"));
  return faces[0].toString();
}

async function main() {
  const loglevelSelect = document.getElementById("loglevel");
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
  player = new shaka.Player(document.getElementById("video"));
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
}

function play(evt) {
  setupPlayer();
  document.title = evt.target.innerText;
  const manifest = evt.target.getAttribute("data-manifest");
  player.load(`ndn:${manifest}`).catch((err) => log.error(`${err}`));
}

document.addEventListener("DOMContentLoaded", main);
