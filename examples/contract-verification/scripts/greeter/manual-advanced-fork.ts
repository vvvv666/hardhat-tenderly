import { readFileSync } from "fs";
import { network, ethers, tenderly } from "hardhat";
import { HttpNetworkConfig } from "hardhat/types";

export async function main() {
  const forkID = `${(network.config as HttpNetworkConfig).url}`.split("/").pop() ?? "";

  console.log("🖖🏽[ethers] Deploying and Verifying Greeter in Tenderly");

  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Manual Hardhat on Fork !");

  await greeter.deployed();
  const greeterAddress = greeter.address;
  console.log("Manual Advanced (fork): {Greeter} deployed to", greeterAddress);

  await tenderly.verifyForkMultiCompilerAPI(
    {
      contracts: [
        {
          contractToVerify: "Greeter",
          sources: {
            "contracts/Greeter.sol": {
              name: "Greeter",
              code: readFileSync("contracts/Greeter.sol", "utf-8").toString(),
            },
            "hardhat/console.sol": {
              name: "console",
              code: readFileSync("node_modules/hardhat/console.sol", "utf-8").toString(),
            },
          },
          // solidity format compiler with a little modification at libraries param
          compiler: {
            version: "0.8.17",
            settings: {
              optimizer: {
                enabled: false,
                runs: 200,
              },
            },
          },
          networks: {
            [forkID]: {
              address: greeterAddress,
            },
          },
        },
      ],
    },
    process.env.TENDERLY_PROJECT ?? "",
    process.env.TENDERLY_USERNAME ?? "",
    forkID
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
