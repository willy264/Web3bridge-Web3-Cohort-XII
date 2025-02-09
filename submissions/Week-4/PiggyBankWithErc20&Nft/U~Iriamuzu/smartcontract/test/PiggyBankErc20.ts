import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";
import { expect } from "chai";

describe("PiggyBankErc20", function () {
  async function deployPiggyBankContract() {

    let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

    const [owner, tokenHolder] = await hre.ethers.getSigners();
    // const Token = await hre.ethers.getContractFactory("MyERC20Token"); // for testing with MyERC20Token

    // for testing with ERC20 using OpenZeppelin
    const Token = await hre.ethers.getContractFactory("MockERC20");
    const token = await Token.deploy();


    const PiggyBankErc20 = await hre.ethers.getContractFactory("PiggyBankErc20");
    const targetAmount = hre.ethers.parseEther("1");
    const latestTime = await time.latest();
    const withdrawalDate = (latestTime + 3600);

    const deployedPiggyBank = await PiggyBankErc20.deploy(
      targetAmount,
      withdrawalDate,
      token.target, // address of the token
      owner.address
    );

    return { deployedPiggyBank, token, owner, tokenHolder, ADDRESS_ZERO };
  }

  describe("Deployment", function () {
    it("Should deploy PiggyBankErc20", async function () {
      const { deployedPiggyBank, owner } = await loadFixture(deployPiggyBankContract);
      const runner = deployedPiggyBank.runner as HardhatEthersSigner;

      expect(runner.address).to.equal(owner.address);    });
  });
});
