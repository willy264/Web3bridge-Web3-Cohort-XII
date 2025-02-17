import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    // Token and Router addresses
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const targetAccount = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621"; // USDC/DAI holder

    // Impersonate the target account
    await helpers.impersonateAccount(targetAccount);
    const impersonatedSigner = await ethers.getSigner(targetAccount);

    // Connect to token contracts
    const usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
    const daiContract = await ethers.getContractAt("IERC20", DAIAddress);
    const uniswapContract = await ethers.getContractAt("IUniswapV2Router02", UNIRouter);

    // Get balances before swap
    const usdcBalBefore = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalBefore = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("USDC Balance Before Swap:", ethers.formatUnits(usdcBalBefore, 6));
    console.log("DAI Balance Before Swap:", ethers.formatUnits(daiBalBefore, 18));

    // Define swap parameters
    const swapAmount = ethers.parseUnits("50000", 6); // 50,000 USDC
    const minAmountOut = ethers.parseUnits("45000", 18); // Minimum DAI
    const deadline = (await helpers.time.latest()) + 1800; // 30 min deadline

    // Approve tokens for the router
    console.log("Approving tokens for swap...");
    await usdcContract.connect(impersonatedSigner).approve(UNIRouter, swapAmount);
    console.log("Approval successful!");

    // Execute the swap
    console.log("Initiating swap...");
    await uniswapContract.connect(impersonatedSigner).swapExactTokensForTokens(
        swapAmount,
        minAmountOut,
        [USDCAddress, DAIAddress],
        impersonatedSigner.address,
        deadline
    );
    console.log("Swap completed!");

    // Get balances after swap
    const usdcBalAfter = await usdcContract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await daiContract.balanceOf(impersonatedSigner.address);

    console.log("USDC Balance After Swap:", ethers.formatUnits(usdcBalAfter, 6));
    console.log("DAI Balance After Swap:", ethers.formatUnits(daiBalAfter, 18));
}

main().catch((error) => {
    console.error("Error during swap:", error);
    process.exitCode = 1;
});
