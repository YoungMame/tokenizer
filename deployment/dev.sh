#! /bin/sh

cd /usr/src/app

pnpm run dev
pnpm run compile
pnpm run deploy:local