import Bugsnag from "@bugsnag/js";
import { connectToTestbed } from "@ndn/autoconfig";
import { Name } from "@ndn/packet";
import { H3Transport } from "@ndn/quic-transport";
import { toHex } from "@ndn/tlv";
import { WsTransport } from "@ndn/ws-transport";
import galite from "ga-lite";

const session = toHex(crypto.getRandomValues(new Uint8Array(8)));
let beaconServer = "";

/**
 * @typedef {{
 *   a: "F"; // fetch response
 *   n: string, // file name
 *   d: number; // file duration in milliseconds
 *   sRtt: number;
 *   rto: number;
 *   cwnd: number;
 * }|{
 *   a: "E"; // fetch error
 *   n: string; // file name
 *   err: string;
 * }|{
 *   a: "P"; // playback
 *   n: string; // playlist name
 *   r: number; // resolution height
 *   fd: number; // decodedFrames
 *   fr: number; // droppedFrames
 *   be: number; // estimatedBandwidth in bps
 *   tl: number; // loadLatency in milliseconds
 *   tp: number; // playTime in milliseconds
 *   tu: number; // pauseTime in milliseconds
 *   tb: number; // bufferingTime in milliseconds
 * }} BeaconData
 */

/** @param {BeaconData} data */
export function sendBeacon(data) {
  data.sess = session;
  data.site = location.origin;
  data.remote = remote;
  if (beaconServer) {
    navigator.sendBeacon(`${beaconServer}/${JSON.stringify(data)}`);
  }
}

if (location.hostname.endsWith(".ndn.today")) {
  beaconServer = "https://ndnts-video-beacon.ndn.today";
  galite("create", "UA-935676-11", "auto");
  galite("send", "pageview");
  Bugsnag.start({ apiKey: "bd98c69a017a18043b500dedb640d9dc" });
} else {
  Bugsnag.start({
    apiKey: "00000000000000000000000000000000",
    enabledReleaseStages: [],
  });
}

/** @type {string|undefined} */
export let remote;

export async function connect() {
  const pref = window.localStorage.getItem("router") ?? "";
  if (pref.startsWith("https:")) {
    try {
      const face = await H3Transport.createFace({}, pref);
      face.addRoute(new Name("/"));
      remote = face.toString();
      return;
    } catch (err) {
      console.warn("preferred HTTP/3 connection error", err);
    }
  }
  if (pref.startsWith("wss:")) {
    try {
      const face = await WsTransport.createFace({}, pref);
      face.addRoute(new Name("/"));
      remote = face.toString();
      return;
    } catch (err) {
      console.warn("preferred WebSocket connection error", err);
    }
  }

  const [face] = await connectToTestbed({
    count: 4,
    preferFastest: true,
    server: "https://fch.ndn.today",
    fchFallback: ["hobo.cs.arizona.edu"],
  });
  remote = face.toString();
}
