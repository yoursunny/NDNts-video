# NDNts Adaptive Video

Production site: [https://ivoosh.ndn.today/](https://ivoosh.ndn.today/).

[![Netlify Status](https://api.netlify.com/api/v1/badges/9397d137-4482-488d-a4b5-78d1e9cf6c00/deploy-status)](https://ivoosh.ndn.today/)

NDNts adaptive video is a video player for the NDN testbed.
This project is built with [NDNts](https://yoursunny.com/p/NDNts/), Named Data Networking libraries for the modern web.
This project demonstrates these NDNts capabilities:

* Use NDNts in a JavaScript project (instead of TypeScript).
* `fetch` function from `@ndn/segmented-object`.
  It uses CUBIC congestion control algorithm to retrieve video segments efficiently.
* Experimental QUIC transport in Chrome browser.
  Activate this feature in the *preferences* section.

![NDNts logo](https://cdn.jsdelivr.net/gh/yoursunny/NDNts@2a598274eaf929c6ab6848b1fee8e998e993a0b4/docs/logo.svg)

This project is inspired by [iViSA project](https://github.com/chavoosh/ndn-video-frontend).
Advantages and unique features include:

* Seamless fallback to YouTube on unsupported browsers.
* Playback statistics display.
* Smaller code bundle delivered to browser.

Build instructions:

1. `npm install` to install dependencies.
2. `npm start` to start development server.
3. `npm run build` to compile production site in `dist/`.
