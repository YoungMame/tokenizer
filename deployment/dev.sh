#! /bin/sh

cd /usr/src/app

pnpm run dev &
    
sleep 5

npx hardhat clean && npx hardhat compile

pnpm run deploy:local &

wait