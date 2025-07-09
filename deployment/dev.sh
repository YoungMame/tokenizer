#! /bin/sh

cd /usr/src/app

pnpm run dev &
    
sleep 5

pnpm run clean && pnpm run compile

pnpm run deploy:local &

wait