FROM ghcr.io/puppeteer/puppeteer:20.4.0
COPY --chown=pptruser:pptruser . /home/pptruser/app
RUN cd /home/pptruser/app \
 && corepack pnpm install \
 && corepack pnpm build \
 && cp content/empty.json public/content.json \
 && cd pptr \
 && corepack pnpm install \
 && cd .. \
 && rm -rf ~/.local/share/pnpm/store ./node_modules
WORKDIR /home/pptruser/app/pptr
ENTRYPOINT ["corepack", "pnpm", "-s", "start"]
