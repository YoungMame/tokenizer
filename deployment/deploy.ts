
// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
        "Deploying the contracts with the account:",
        await deployer.getAddress()
    );

    // /   console.log("Account balance:", (await deployer.getBalance()).toString());
    // console.log("Account balance:", (await deployer.getBalance()).toString());

    const Token = await ethers.getContractFactory("MameCoin42");
    console.log("Token contract factory:", Token);
    const supply = ethers.parseUnits("5000000", 8); // 5 million tokens with 8 decimals
    const token = await Token.deploy(supply, [], [], []);
    console.log("token object:", token);
    // No need to call token.deployed(), deploy() already waits for deployment

    console.log("Token address:", token.target);

    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
    // const fs = require("fs");
    // const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

    // if (!fs.existsSync(contractsDir)) {
    //     fs.mkdirSync(contractsDir);
    // }

    // fs.writeFileSync(
    //     path.join(contractsDir, "contract-address.json"),
    //     JSON.stringify({ Token: token.address }, undefined, 2)
    // );

    // const TokenArtifact = artifacts.readArtifactSync("MameCoin");

    // fs.writeFileSync(
    //     path.join(contractsDir, "Token.json"),
    //     JSON.stringify(TokenArtifact, null, 2)
    // );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });