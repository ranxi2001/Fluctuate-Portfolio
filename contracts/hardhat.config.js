import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        // Mantle 测试网
        mantleTestnet: {
            url: "https://rpc.testnet.mantle.xyz",
            chainId: 5003,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 20000000000, // 20 gwei
        },
        // Mantle 主网（后续使用）
        mantleMainnet: {
            url: "https://rpc.mantle.xyz",
            chainId: 5000,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 20000000000,
        },
        // 本地测试网
        hardhat: {
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: {
            mantleTestnet: process.env.MANTLE_API_KEY || "no-api-key-needed",
            mantleMainnet: process.env.MANTLE_API_KEY || "no-api-key-needed",
        },
        customChains: [
            {
                network: "mantleTestnet",
                chainId: 5003,
                urls: {
                    apiURL: "https://api-sepolia.mantlescan.xyz/api",
                    browserURL: "https://sepolia.mantlescan.xyz",
                },
            },
            {
                network: "mantleMainnet",
                chainId: 5000,
                urls: {
                    apiURL: "https://api.mantlescan.xyz/api",
                    browserURL: "https://mantlescan.xyz",
                },
            },
        ],
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};
