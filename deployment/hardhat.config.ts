import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";

// const forkingData: Object = {
//   url: process.env.FUJI_URL || "https://api.avax-test.network/ext/bc/C/rpc",
// };

const forkingData = undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      // optimizer is enabled to reduce gas costs
      optimizer: {
        enabled: true,
        runs: 200, // 200 is a good default for most contracts
      },
    },
  },
  paths: {
    sources: "./code",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      gasPrice: 1000000000, // 1 Gwei = 1_000_000_000 wei = 0.001 ETH is an avergae gas price for testing
      chainId: !forkingData ? 43112 : undefined,
      forking: forkingData,
      accounts: { count: 10, accountsBalance: "10000000000000000000000" } // 10_000 ETH for each account
    },
    fuji: {
      gasPrice: 1000000000, // 1 Gwei = 1_000_000_000 wei = 0.001 ETH is an avergae gas price for testing
      url: process.env.FUJI_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: Number(process.env.FUJI_CHAIN_ID) || 43113,
      accounts: [process.env.SIGNER_PRIVATE_KEY || ""]
    },
  }
};

export default config;
