# NDNts Adaptive Video

Demo sites:

* [NDNts video demo (educational content)](https://ndnts-video.ndn.today/)
* [Push-ups solve all the problems](https://pushups.ndn.today/)

NDNts adaptive video is a video player for global NDN network.
This project is built with [NDNts](https://yoursunny.com/p/NDNts/), Named Data Networking libraries for the modern web.
This project demonstrates these NDNts capabilities:

* Use NDNts in a JavaScript project (instead of TypeScript).
* `fetch` function from `@ndn/segmented-object`.
  It uses CUBIC congestion control algorithm to retrieve video segments efficiently.

![NDNts logo](https://cdn.jsdelivr.net/gh/yoursunny/NDNts@2a598274eaf929c6ab6848b1fee8e998e993a0b4/docs/logo.svg)

This project is inspired by [iViSA project](https://github.com/chavoosh/ndn-video-frontend).
Advantages and unique features include:

* Seamless fallback to YouTube on unsupported browsers.
* Playback statistics display.
* Smaller code bundle delivered to browser.

[NDNts homepage](https://yoursunny.com/p/NDNts/) has blog articles about experiments using this application.

Build instructions:

1. `corepack pnpm install` to install dependencies.
2. Create `public/content.json` or copy one from `content/` directory.
3. `corepack pnpm serve` to start development server and visit `http://localhost:3333`.
4. `corepack pnpm build` to compile production site in `public/`.

Related code:

* [server](./server): encode script and server deployment.
* [pptr](./pptr): Puppeteer automation.
