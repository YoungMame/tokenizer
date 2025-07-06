import path from 'path';
import fs from 'fs';

async function main() {
  
    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
    );
    console.log(deployer);
   
    const MameCoinFactory = await ethers.getContractFactory("MameCoin");
    const mameCoin = await MameCoinFactory.deploy();
    console.log("MameCoin contract address:", mameCoin.target);

    saveFrontendFiles(mameCoin);
}

function saveFrontendFiles(mameCoin: any) {
    const contractsDir = path.join(__dirname, "..", "contractData");
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify({ value: mameCoin.target }, undefined, 2)
    );

    const MameCoinArtifact = artifacts.readArtifactSync("MameCoin");

    fs.writeFileSync(
      path.join(contractsDir, "MameCoin.json"),
      JSON.stringify(MameCoinArtifact, null, 2)
    );
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});