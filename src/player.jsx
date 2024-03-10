import { el } from "redom";
import shaka from "shaka-player";

import { NdnPlugin } from "./shaka-ndn-plugin.js";

shaka.polyfill.installAll();
const isBrowserSupported = shaka.Player.isBrowserSupported() &&
  !/\((?:iPhone|iPad); /.test(navigator.userAgent);
shaka.net.NetworkingEngine.registerScheme("ndn", NdnPlugin);

/** Render NDN player. */
export class Player {
  static supported = isBrowserSupported;

  constructor() {
    <video this="el" controls autoplay/>;
  }

  async onmount() {
    this.player = new shaka.Player();
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
    await this.player.attach(this.el);
  }

  /** @param {import("./content.js").Entry} entry */
  update(entry) {
    const { name } = entry;
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
