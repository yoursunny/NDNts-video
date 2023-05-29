# Server Deployment for NDN Adaptive Video

NDNts adaptive video can play videos encoded by Shaka Packager and served by [ndn6-file-server](https://github.com/yoursunny/ndn6-tools/blob/main/file-server.md) producer application.

## Encoding

Install FFmpeg and Shaka Packager:

```bash
sudo apt install ffmpeg
curl -fsLS https://github.com/shaka-project/shaka-packager/releases/download/v2.6.1/packager-linux-x64 | \
  sudo install /dev/stdin /usr/local/bin/shaka-packager
```

Alternatively, you can specify `USE_DOCKER=1` environ when invoking `encode.sh` script to use Docker images of these programs.
You can additionally specify `DOCKER_LIMITS="--cpus 0.5 --memory 512MB"` environ to set CPU and RAM limits.

Encode a video:

```bash
./encode.sh ~/video-input/1.mp4 ~/video-output/1
```

## Serving

You need to install [ndn6-tools](https://github.com/yoursunny/ndn6-tools), which is available from [NFD nightly builds](https://nfd-nightly.ndn.today/).

Serve a folder:

```bash
ndn6-file-server /example/video ~/video-output
```

Alternatively, you can use [NDN-DPDK fileserver](https://github.com/usnistgov/ndn-dpdk/blob/main/docs/fileserver.md), which implements the same protocol.
