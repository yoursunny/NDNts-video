# NDN Video Player

Production site: [https://ivoosh.ndn.today/](https://ivoosh.ndn.today/).

[![Netlify Status](https://api.netlify.com/api/v1/badges/9397d137-4482-488d-a4b5-78d1e9cf6c00/deploy-status)](https://ivoosh.ndn.today/)

NDN Video Player built with [NDNts](https://yoursunny.com/p/NDNts/), using same protocol as [Chavoosh's ndn-video-frontend](https://github.com/chavoosh/ndn-video-frontend).

![NDNts logo](public/logo.svg)

This project demonstrates these NDNts capabilities:

* Use NDNts in a JavaScript project (instead of TypeScript).
* `fetch` function from `@ndn/segmented-object`.
  It has congestion control features, allowing efficient retrieval of video segments.

Build instructions:

1. `npm install` to install dependencies.
2. `npm run serve` to start development server.
3. `npm run build` to compile production site in `public/`.
