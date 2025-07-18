# Tokenizer
This project consist in creating a token via a Smart contract on BTC or ETHER blockchain i the respect of the current blockchain smart contract norm, in my case i'll use ETHER so i'ill have to respect ERC20 norm.

I implemented a multisig system to allow multiple users to sign transactions before they are executed, enhancing security and preventing unauthorized access.

User can enable multisig that will deploy a Multisig contract, add and remove signers, submit transactions, and sign transactions to execute them once the required number of signatures is reached.

# Features
- Smart contract deployment using Hardhat
- Smart contract testing
- Dockerized environment for development and deployment
- Ownable contract for managing ownership
- MameCoin42 token contract with minting and burning capabilities
- Multisig implementation for secure transactions

# Requirements
To run the project, you need to have the following software installed on your machine:
- Docker
- Docker Compose
- Makefile (optional)

# Configuration
To configure the project, you need to set up the environment variables in a `.env` file in the root of the project. You can use the `.env.example` file as a template.
```bash
cp .env.example .env
```

In deployment/hardhat.config.ts, you can set the network configuration for the smart contract deployment. The default network is `fuji`, but you can change it to `localhost` or any other network you want to use.

# Usage
To run the smart contract tests, you can run the following command in the root of the project:
```bash
make test
```
This command will run the tests in the smart contract and display the results in the console.

# Deployment
To deploy the smart contract, you can run the following command in the root of the project:
```bash
make deploy
```
This command will deploy the smart contract to the fuji testnet and display the address of the deployed contract in the console.

# Using the token

To use the token you will have to log in on a wallet with the deployer address, then select fuji testnet or add, and select the MameCoin42 token in your wallet or add it, then you can send tokens to other addresses