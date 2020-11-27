import { el } from "redom";
import shaka from "shaka-player";

import { NdnPlugin } from "./shaka-ndn-plugin.js";

shaka.polyfill.installAll();
const isBrowserSupported = shaka.Player.isBrowserSupported() &&
  !/\((?:iPhone|iPad); /.test(navigator.userAgent);
shaka.net.NetworkingEngine.registerScheme("ndn", NdnPlugin);

export class Player {
  static supported = isBrowserSupported;

  constructor() {
    <video this="el" controls autoplay/>;
  }

  onmount() {
    this.player = new shaka.Player(this.el);
    this.player.configure({
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

  update({ name }) {
    NdnPlugin.reset();
    this.player.load(`ndn:${name}`);
  }

  getStat() {
    return {
      playerStats: this.player.getStats(),
      ndnInternals: NdnPlugin.getInternals(),
    };
  }
}
