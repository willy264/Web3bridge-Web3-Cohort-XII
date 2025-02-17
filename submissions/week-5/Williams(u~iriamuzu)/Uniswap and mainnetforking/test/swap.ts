import { expect } from "chai";
import { ethers } from "hardhat";

describe("Swap Contract", function () {
    let swap: any;
    let Atoken: any;
    let Btoken: any;
    let owner: any;
    let user1: any;
    let user2: any;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const AToken = await ethers.getContractFactory("AToken");
        Atoken = await AToken.deploy();
        await Atoken.waitForDeployment();

        const BToken = await ethers.getContractFactory("BToken");
        Btoken = await BToken.deploy();
        await Btoken.waitForDeployment();

        const Swap = await ethers.getContractFactory("Swap");
        swap = await Swap.deploy(await Atoken.getAddress(), await Btoken.getAddress());
        await swap.waitForDeployment();

        console.log("AToken Address:", await Atoken.getAddress());
        console.log("BToken Address:", await Btoken.getAddress());
        console.log("Swap Address:", await swap.getAddress());

        const amount = ethers.parseUnits("1000", 18);
        await Atoken.transfer(user1.address, amount);
        await Btoken.transfer(user1.address, amount);
        await Atoken.transfer(user2.address, amount);
        await Btoken.transfer(user2.address, amount);
    });

    it("Should deploy successfully", async function () {
        expect(await Atoken.getAddress()).to.properAddress;
        expect(await Btoken.getAddress()).to.properAddress;
        expect(await swap.getAddress()).to.properAddress;
    });

    it("Should add liquidity successfully", async function () {
        const amountX = ethers.parseUnits("100", 18);
        const amountY = ethers.parseUnits("100", 18);

        await Atoken.connect(user1).approve(await swap.getAddress(), amountX);
        await Btoken.connect(user1).approve(await swap.getAddress(), amountY);

        await expect(swap.connect(user1).addLiquidity(amountX, amountY))
            .to.emit(swap, "LiquidityAdded")
            .withArgs(user1.address, amountX, amountY);

        expect(await swap.reserveX()).to.equal(amountX);
        expect(await swap.reserveY()).to.equal(amountY);
    });

    it("Should swap AToken for BToken successfully", async function () {
        const amountX = ethers.parseUnits("100", 18);
        const amountY = ethers.parseUnits("100", 18);

        await Atoken.connect(user1).approve(await swap.getAddress(), amountX);
        await Btoken.connect(user1).approve(await swap.getAddress(), amountY);
        await swap.connect(user1).addLiquidity(amountX, amountY);

        const swapAmount = ethers.parseUnits("10", 18);
        await Atoken.connect(user1).approve(await swap.getAddress(), swapAmount);

        await expect(swap.connect(user1).swap(swapAmount, true, user1.address))
            .to.emit(swap, "Swapped");

        expect(await swap.reserveX()).to.be.gte(amountX + swapAmount);
    });

    it("Should fail swapping when insufficient liquidity", async function () {
      // Freshly deploy contract to ensure zero liquidity
      const AToken = await ethers.getContractFactory("AToken");
      const Atoken = await AToken.deploy();
      await Atoken.waitForDeployment();
  
      const BToken = await ethers.getContractFactory("BToken");
      const Btoken = await BToken.deploy();
      await Btoken.waitForDeployment();
  
      const Swap = await ethers.getContractFactory("Swap");
      const swap = await Swap.deploy(await Atoken.getAddress(), await Btoken.getAddress());
      await swap.waitForDeployment();
  
      console.log("Swap Address:", await swap.getAddress());
  
      expect(await swap.reserveX()).to.equal(0);
      expect(await swap.reserveY()).to.equal(0);
  
      const swapAmount = ethers.parseUnits("10", 18);
      await Atoken.connect(user1).approve(await swap.getAddress(), swapAmount);
  
      await expect(swap.connect(user1).swap(swapAmount, true, user1.address))
          .to.be.reverted;
  });
  

    it("Should fail adding zero liquidity", async function () {
        await expect(swap.connect(user1).addLiquidity(0, 100))
            .to.be.reverted;
    });

    it("Should fail swapping with zero amount", async function () {
        await expect(swap.connect(user1).swap(0, true, user1.address))
            .to.be.reverted;
    });

    it("Should update reserves correctly after liquidity addition", async function () {

      [owner, user1, user2] = await ethers.getSigners();

      const AToken = await ethers.getContractFactory("AToken");
      const Atoken = await AToken.deploy();
      await Atoken.waitForDeployment();
  
      const BToken = await ethers.getContractFactory("BToken");
      const Btoken = await BToken.deploy();
      await Btoken.waitForDeployment();
  
      const Swap = await ethers.getContractFactory("Swap");
      const swap = await Swap.deploy(await Atoken.getAddress(), await Btoken.getAddress());
      await swap.waitForDeployment();
  
      console.log("Swap Address:", await swap.getAddress());

      const amount = ethers.parseUnits("1000", 18);
    await Atoken.connect(owner).transfer(user1.address, amount);
    await Btoken.connect(owner).transfer(user1.address, amount);
    await Atoken.connect(owner).transfer(user2.address, amount);
    await Btoken.connect(owner).transfer(user2.address, amount);
  
      expect(await swap.reserveX()).to.equal(0);
      expect(await swap.reserveY()).to.equal(0);
  
      // Add liquidity
      const initialX = ethers.parseUnits("100", 18);
      const initialY = ethers.parseUnits("100", 18);
  
      await Atoken.connect(user1).approve(await swap.getAddress(), initialX);
      await Btoken.connect(user1).approve(await swap.getAddress(), initialY);
      await swap.connect(user1).addLiquidity(initialX, initialY);
  
      const reserveX = await swap.reserveX();
      const reserveY = await swap.reserveY();
  
      console.log("🔹 Expected:", initialX.toString(), "Actual:", reserveX.toString());
  
      expect(reserveX).to.be.closeTo(initialX, ethers.parseUnits("1", 18));
      expect(reserveY).to.be.closeTo(initialY, ethers.parseUnits("1", 18));
  });
  
});