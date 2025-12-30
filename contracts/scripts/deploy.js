import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log("🚀 开始部署 FluctuatePortfolio 合约...\n");

    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log("部署账户:", deployer.address);

    // 获取账户余额
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("账户余额:", hre.ethers.formatEther(balance), "MNT\n");

    // 部署合约
    console.log("正在部署合约...");
    const FluctuatePortfolio = await hre.ethers.getContractFactory("FluctuatePortfolio");
    const contract = await FluctuatePortfolio.deploy();

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ 合约部署成功!");
    console.log("合约地址:", contractAddress);
    console.log("部署交易:", contract.deploymentTransaction()?.hash);
    console.log("网络:", hre.network.name);
    console.log("区块链浏览器:", getExplorerUrl(hre.network.name, contractAddress));

    // 等待几个区块确认后验证合约
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("\n等待 5 个区块确认后验证合约...");
        await contract.deploymentTransaction()?.wait(5);

        try {
            console.log("正在验证合约...");
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
            console.log("✅ 合约验证成功!");
        } catch (error) {
            console.log("⚠️ 合约验证失败:", error.message);
            console.log("可以稍后手动验证");
        }
    }

    // 保存部署信息
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: contractAddress,
        deploymentTransaction: contract.deploymentTransaction()?.hash,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber(),
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");

    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const filename = `${hre.network.name}_${Date.now()}.json`;
    fs.writeFileSync(
        path.join(deploymentsDir, filename),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📝 部署信息已保存到:", `deployments/${filename}`);
}

function getExplorerUrl(network, address) {
    const explorers = {
        mantleTestnet: `https://sepolia.mantlescan.xyz/address/${address}`,
        mantleMainnet: `https://mantlescan.xyz/address/${address}`,
    };
    return explorers[network] || "N/A";
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });
