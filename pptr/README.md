# Puppeteer Automation for NDNts Adaptive Video

This folder contains a [Puppeteer](https://pptr.dev/) script that performs automated video playback.
It controls a headless Chromium browser, connects to a specified NDN router, and plays the specified video.

## Setup Instructions

To setup as Node.js application:

1. Follow [NDNts-video build instruction](..) to compile a production site in `../public`.
2. Run `corepack pnpm install` in this directory to install dependencies.
3. You can run this script with `corepack pnpm -s start` followed by command line flags.

To setup as Docker container image:

1. Run `docker build -t ndnts-video-pptr . -f pptr/Dockerfile` in parent directory.
2. You can run this script with `docker run --rm --cap-add=SYS_ADMIN ndnts-video-pptr` followed by command line flags.

## Command Line Flags

`--router` specifies a preferred NDN router.
It can be either a WebSocket gateway or an HTTP/3 [WebTransport gateway](https://github.com/yoursunny/NDN-webtrans).
If this is omitted or the router is unreachable, the webapp will query [NDN-FCH 2021](https://github.com/11th-ndn-hackathon/ndn-fch) API and connect to a nearby router.
It is not recommended to rely on NDN-FCH for the purpose of automated testing.

`--video` specifies the NDN name of the video metadata.
The video must be retrievable through the specified NDN router.
Most published videos are encoded with either H264 or VP9 codec.
Due to the limitation of Chromium browser installed by Puppeteer, this script can only playback VP9 encoded videos.

`--timeout` specifies the playback timeout in milliseconds.
The script stops the browser and exits either 8 seconds after the playback completion or the timeout duration has elapsed, whichever occurs earlier.

## Interpreting Results

Browser console messages are redirected to stdout.
Messages starting with `BEACON` reflect playback status and file fetching statistics.
Look at [connect.js](../src/connect.js) `BeaconData` typedef for its semantics.
