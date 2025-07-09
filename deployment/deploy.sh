#! /bin/sh

cd /usr/src/app

echo "Production script"

pnpm run dev &
    
sleep 5

pnpm run clean && pnpm run compile

pnpm run deploy &

wait
