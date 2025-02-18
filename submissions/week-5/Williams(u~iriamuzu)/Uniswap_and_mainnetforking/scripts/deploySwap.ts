import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const [owner, user1, user2] = await ethers.getSigners();

    console.log("\nDeploying AToken...");
    const AToken = await ethers.getContractFactory("AToken");
    const Atoken = await AToken.deploy();
    await Atoken.waitForDeployment();

    console.log("Deploying BToken...");
    const BToken = await ethers.getContractFactory("BToken");
    const Btoken = await BToken.deploy();
    await Btoken.waitForDeployment();

    console.log("Deploying Swap Contract...");
    const Swap = await ethers.getContractFactory("Swap");
    const swap = await Swap.deploy(await Atoken.getAddress(), await Btoken.getAddress());
    await swap.waitForDeployment();

    console.log("\ Deployment Completed!");
    console.log(`AToken Address: ${await Atoken.getAddress()}`);
    console.log(`BToken Address: ${await Btoken.getAddress()}`);
    console.log(`Swap Address: ${await swap.getAddress()}`);

    // Give user1 some tokens
    const initialAmount = ethers.parseUnits("1000", 18);
    await Atoken.transfer(user1.address, initialAmount);
    await Btoken.transfer(user1.address, initialAmount);
    console.log(`Transferred ${initialAmount} AToken & BToken to user1`);

    // User1 approves Swap contract
    const liquidityAmount = ethers.parseUnits("100", 18);
    await Atoken.connect(user1).approve(await swap.getAddress(), liquidityAmount);
    await Btoken.connect(user1).approve(await swap.getAddress(), liquidityAmount);
    console.log(`User1 approved ${liquidityAmount} AToken & BToken for Swap contract`);

    // User1 adds liquidity
    await swap.connect(user1).addLiquidity(liquidityAmount, liquidityAmount);
    console.log(`User1 added ${liquidityAmount} liquidity`);

    // Check reserves
    let reserveX = await swap.reserveX();
    let reserveY = await swap.reserveY();
    console.log(`Reserves: AToken: ${reserveX}, BToken: ${reserveY}`);

    // User1 swaps AToken for BToken
    const swapAmountX = ethers.parseUnits("10", 18);
    await Atoken.connect(user1).approve(await swap.getAddress(), swapAmountX);
    await swap.connect(user1).swap(swapAmountX, true, user1.address);
    console.log(`User1 swapped ${swapAmountX} AToken for BToken`);

    // User1 swaps BToken for AToken
    const swapAmountY = ethers.parseUnits("5", 18);
    await Btoken.connect(user1).approve(await swap.getAddress(), swapAmountY);
    await swap.connect(user1).swap(swapAmountY, false, user1.address);
    console.log(` User1 swapped ${swapAmountY} BToken for AToken`);

    // Check updated reserves
    reserveX = await swap.reserveX();
    reserveY = await swap.reserveY();
    console.log(`Updated Reserves: AToken: ${reserveX}, BToken: ${reserveY}`);

    // Check User1's balance
    const user1ATokenBalance = await Atoken.balanceOf(user1.address);
    const user1BTokenBalance = await Btoken.balanceOf(user1.address);
    console.log(`User1 Balance: AToken: ${user1ATokenBalance}, BToken: ${user1BTokenBalance}`);
}

// Run the script
main().catch((error) => {
    console.error(error);
    process.exit(1);
});