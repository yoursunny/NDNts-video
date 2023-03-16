import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";

import statik from "node-static";
import { launch } from "puppeteer";
import stdout from "stdout-stream";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

const argv = yargs(hideBin(process.argv))
  .option({
    port: { type: "number", desc: "HTTP server port number", default: 3333 },
    router: { type: "string", desc: "NDN router" },
    video: { type: "string", desc: "video NDN name", demandOption: true },
    duration: { type: "number", desc: "playback duration" },
  })
  .parseSync();

const fileServer = new statik.Server("../public");
const server = createServer((req, res) => {
  stdout.write(`${Date.now()} HTTP ${req.method} ${req.url}\n`);
  req.on("end", () => { fileServer.serve(req, res); }).resume();
}).listen(argv.port, "127.0.0.1");

const browser = await launch();
const page = await browser.newPage();
page.on("console", (msg) => {
  stdout.write(`${Date.now()} ${msg.text()}\n`);
});

await page.goto(`http://127.0.0.1:${argv.port}/robots.txt`);
await page.evaluate(`
  window.localStorage.setItem("router", decodeURIComponent("${encodeURIComponent(argv.router ?? "")}"));
  window.localStorage.setItem("beacon-console", "1");
`);

await page.goto(`http://127.0.0.1:${argv.port}/#play=${argv.video}`);
const $video = await page.waitForSelector("video");

if(argv.duration) {
  await $video.tap()
  await setTimeout(argv.duration);
} else {
  const videoEnd = new Promise(async (resolve) => {
    await $video.evaluate(async (video) => {
      const end = new Promise((resolve) => {
        video.addEventListener("ended", () => {
          resolve();
        });
      });

      video.dispatchEvent(new MouseEvent('tap', { bubbles: true, cancelable: true }));
      await end;
    }, $video);

    resolve();
  });

  await videoEnd;
}

await browser.close();
server.close();
stdout.write(`${Date.now()} EXIT\n`);