# Puppeteer Automation for NDN Adaptive Video

This folder contains a [Puppeteer](https://pptr.dev/) script that performs automated video playback.
It controls a headless Chromium browser, connects to a specified NDN router, and plays the specified video.

Usage instructions:

1. Follow [NDNts-video build instruction](..) to compile a production site in `../public`.
2. `corepack pnpm install` to install dependencies.
3. `corepack pnpm -s start --help` to see command line options.
4. Re-run with appropriate options.

Console messages are redirected to stdout.
Messages starting with `BEACON` reflect playback status and file fetching statistics.
Look at [connect.js](../src/connect.js) `BeaconData` typedef for its semantics.
