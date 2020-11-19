import Bugsnag from "@bugsnag/js";
import { connectToTestbed } from "@ndn/autoconfig";
import { Name } from "@ndn/packet";
import { QuicTransport } from "@ndn/quic-transport";
import galite from "ga-lite";
import { get as hashGet } from "hashquery";

if (location.hostname.endsWith(".ndn.today")) {
  galite("create", "UA-935676-11", "auto");
  galite("send", "pageview");
  Bugsnag.start({ apiKey: "bd98c69a017a18043b500dedb640d9dc" });
}

export async function connect() {
  /** @type {string|undefined} */
  const quic = hashGet("quic");
  if (quic) {
    try {
      const uri = quic.startsWith("quic-transport:") ? quic :
        "quic-transport://quic-gateway-us-ny.ndn.today:6367/ndn";
      const face = await QuicTransport.createFace({}, uri);
      face.addRoute(new Name("/"));
      return face.toString();
    } catch (err) {
      console.warn("QUIC connection error", err);
    }
  }

  const faces = await connectToTestbed({
    count: 4,
    preferFastest: true,
    fchFallback: ["hobo.cs.arizona.edu"],
  });
  return faces[0].toString();
}
