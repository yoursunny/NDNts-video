import Bugsnag from "@bugsnag/js";
import { connectToTestbed } from "@ndn/autoconfig";
import { Name } from "@ndn/packet";
import { QuicTransport } from "@ndn/quic-transport";
import { WsTransport } from "@ndn/ws-transport";
import galite from "ga-lite";

if (location.hostname.endsWith(".ndn.today")) {
  galite("create", "UA-935676-11", "auto");
  galite("send", "pageview");
  Bugsnag.start({ apiKey: "bd98c69a017a18043b500dedb640d9dc" });
}

/** @type {string|undefined} */
export let remote;

export async function connect() {
  const pref = window.localStorage.getItem("router") ?? "";
  if (pref.startsWith("quic-transport:")) {
    try {
      const face = await QuicTransport.createFace({}, pref);
      face.addRoute(new Name("/"));
      remote = face.toString();
      return;
    } catch (err) {
      console.warn("preferred QUIC connection error", err);
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
    fchFallback: ["hobo.cs.arizona.edu"],
  });
  remote = face.toString();
}
