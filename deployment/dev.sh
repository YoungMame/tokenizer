#! /bin/sh

cd /usr/src/app

pnpm run test &
sleep infinity

# if we wanted to create a dapp we should uncomment these lines to keep a local hardhat node alive
#   and compile, deploy our contract in local and call the node as a json rpc provider from our d app
# pnpm run dev
# pnpm run compile
# pnpm run deploy:local

