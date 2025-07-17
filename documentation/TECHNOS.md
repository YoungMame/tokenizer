# Project technos

## OpenZeppelin

OpenZeppelin is a library for secure smart contract development. It provides reusable and secure smart contract components, including the ERC20 token standard implementation.

I chose to use OpenZeppelin implementation of ERC20 for the MameCoin42 token because it's tested and widely used library that follows best practices in smart contract development used by most of the DeFi projects.

## Solidity

Solidity is a programming language for writing smart contracts on the Ethereum blockchain.

## Docker

This project use docker to create a dev, test and prod environment.

## Hardhat

Hardhat is a development environment to compile, deploy, test, and debug solidity code.

It allows you to run a local Ethereum network, deploy smart contracts, and interact with them using JavaScript.

I wrote a suite of tests to ensure the smart contract works as expected in /test.

### To run the tests, you can use the following command:

```bash
make test
```

At this point the test container will be running, if you want to run the tests again you can attach shell to the container with:

```bash
docker exec -it docker-container sh
```

and in it
```bash
npx hardhat test
```

### To deploy the smart contract, you can use the following command:

```bash
make deploy
```

this command will run the docker container and deploy the smart contract to the fuji testnet. When it's done you will see the address of the deployed contract in the console.
You can stop the container.

### To start a local Hardhat network, you can use the following command:

```bash
make dev
```

This command will run the docker container, start a local Hardhat network and deploy the smart contract to it. You can then interact with the smart contract using a frontend or a script.
