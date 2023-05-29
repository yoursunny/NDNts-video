import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";

import statik from "node-static";
import pDefer from "p-defer";
import { launch } from "puppeteer";
import stdout from "stdout-stream";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

const argv = yargs(hideBin(process.argv))
  .option({
    port: { type: "number", desc: "HTTP server port number", default: 3333 },
    router: { type: "string", desc: "NDN router" },
    video: { type: "string", desc: "video NDN name", demandOption: true },
    timeout: { type: "number", desc: "playback timeout", default: 600_000 },
  })
  .parseSync();

const fileServer = new statik.Server("../public");
const server = createServer((req, res) => {
  stdout.write(`${Date.now()} HTTP ${req.method} ${req.url}\n`);
  if (req.url === "/200") {
    res.end();
    return;
  }
  req.on("end", () => { fileServer.serve(req, res); }).resume();
}).listen(argv.port, "127.0.0.1");

const browser = await launch({ headless: "new" });
const page = await browser.newPage();
page.on("console", (msg) => {
  stdout.write(`${Date.now()} ${msg.text()}\n`);
});

await page.goto(`http://127.0.0.1:${argv.port}/200`);
await page.evaluate(`
  window.localStorage.setItem("router", decodeURIComponent("${encodeURIComponent(argv.router ?? "")}"));
  window.localStorage.setItem("beacon-console", "1");
`);

await page.goto(`http://127.0.0.1:${argv.port}/#play=${argv.video}`);
const $video = await page.waitForSelector("video");

const videoEnd = pDefer();
await page.exposeFunction("videoEnded", () => videoEnd.resolve("ENDED"));
await page.evaluate(`
  document.querySelector("video").addEventListener("ended", () => {
    setTimeout(() => globalThis.videoEnded(), 8000);
  });
`);
await $video.tap();

const abortTimer = new AbortController();
const timeout = setTimeout(argv.timeout, "TIMEOUT", { signal: abortTimer.signal });

const exitReason = await Promise.race([videoEnd.promise, timeout]);
abortTimer.abort();

await browser.close();
server.close();
stdout.write(`${Date.now()} EXIT ${exitReason}\n`);
