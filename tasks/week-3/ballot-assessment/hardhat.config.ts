import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";require("dotenv").config();

const {ALCHEMY_SEPOLIA_API_KEY_URL, ALCHEMY_AMOY_API_KEY_URL, LISK_API_KEY_URL, ACCOUNT_PRIVATE_KEY} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    hardhat: {
    },
    liskSepolia: {
      url: LISK_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    }
  }
};

export default config;
