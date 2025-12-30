import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("FluctuatePortfolio", function () {
    let FluctuatePortfolio;
    let contract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        // 获取测试账户
        [owner, addr1, addr2] = await ethers.getSigners();

        // 部署合约
        FluctuatePortfolio = await ethers.getContractFactory("FluctuatePortfolio");
        contract = await FluctuatePortfolio.deploy();
        await contract.waitForDeployment();
    });

    describe("部署测试", function () {
        it("应该成功部署合约", async function () {
            expect(await contract.getAddress()).to.be.properAddress;
        });

        it("初始用户数量应该为 0", async function () {
            expect(await contract.getTotalUsers()).to.equal(0);
        });
    });

    describe("更新投资组合", function () {
        it("应该能够添加单个资产", async function () {
            const assets = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1.5"),
                    buyPrice: ethers.parseEther("50000"),
                },
            ];

            await contract.updatePortfolio(assets);

            const [retrievedAssets, lastUpdated] = await contract.getMyPortfolio();
            expect(retrievedAssets.length).to.equal(1);
            expect(retrievedAssets[0].symbol).to.equal("BTC");
            expect(retrievedAssets[0].amount).to.equal(ethers.parseEther("1.5"));
            expect(lastUpdated).to.be.gt(0);
        });

        it("应该能够添加多个资产", async function () {
            const assets = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("50000"),
                },
                {
                    symbol: "ETH",
                    amount: ethers.parseEther("10"),
                    buyPrice: ethers.parseEther("3000"),
                },
                {
                    symbol: "XAU",
                    amount: ethers.parseEther("5"),
                    buyPrice: ethers.parseEther("2000"),
                },
            ];

            await contract.updatePortfolio(assets);

            const [retrievedAssets] = await contract.getMyPortfolio();
            expect(retrievedAssets.length).to.equal(3);
            expect(retrievedAssets[0].symbol).to.equal("BTC");
            expect(retrievedAssets[1].symbol).to.equal("ETH");
            expect(retrievedAssets[2].symbol).to.equal("XAU");
        });

        it("应该触发 PortfolioUpdated 事件", async function () {
            const assets = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("50000"),
                },
            ];

            await expect(contract.updatePortfolio(assets))
                .to.emit(contract, "PortfolioUpdated")
                .withArgs(owner.address, 1, await getBlockTimestamp());
        });

        it("更新投资组合应该覆盖旧数据", async function () {
            // 第一次更新
            const assets1 = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("50000"),
                },
            ];
            await contract.updatePortfolio(assets1);

            // 第二次更新
            const assets2 = [
                {
                    symbol: "ETH",
                    amount: ethers.parseEther("10"),
                    buyPrice: ethers.parseEther("3000"),
                },
                {
                    symbol: "USDT",
                    amount: ethers.parseEther("1000"),
                    buyPrice: ethers.parseEther("1"),
                },
            ];
            await contract.updatePortfolio(assets2);

            const [retrievedAssets] = await contract.getMyPortfolio();
            expect(retrievedAssets.length).to.equal(2);
            expect(retrievedAssets[0].symbol).to.equal("ETH");
            expect(retrievedAssets[1].symbol).to.equal("USDT");
        });

        it("应该拒绝空投资组合", async function () {
            await expect(contract.updatePortfolio([])).to.be.revertedWith(
                "Portfolio cannot be empty"
            );
        });

        it("应该拒绝超过 50 个资产", async function () {
            const assets = Array(51)
                .fill()
                .map((_, i) => ({
                    symbol: `TOKEN${i}`,
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("100"),
                }));

            await expect(contract.updatePortfolio(assets)).to.be.revertedWith(
                "Too many assets (max 50)"
            );
        });

        it("应该拒绝空符号", async function () {
            const assets = [
                {
                    symbol: "",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("100"),
                },
            ];

            await expect(contract.updatePortfolio(assets)).to.be.revertedWith(
                "Symbol cannot be empty"
            );
        });

        it("应该拒绝零数量", async function () {
            const assets = [
                {
                    symbol: "BTC",
                    amount: 0,
                    buyPrice: ethers.parseEther("100"),
                },
            ];

            await expect(contract.updatePortfolio(assets)).to.be.revertedWith(
                "Amount must be greater than 0"
            );
        });
    });

    describe("查询投资组合", function () {
        beforeEach(async function () {
            const assets = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("50000"),
                },
            ];
            await contract.updatePortfolio(assets);
        });

        it("应该能够查询自己的投资组合", async function () {
            const [assets, lastUpdated] = await contract.getMyPortfolio();
            expect(assets.length).to.equal(1);
            expect(assets[0].symbol).to.equal("BTC");
            expect(lastUpdated).to.be.gt(0);
        });

        it("应该能够查询其他用户的投资组合", async function () {
            const [assets] = await contract.getPortfolio(owner.address);
            expect(assets.length).to.equal(1);
            expect(assets[0].symbol).to.equal("BTC");
        });

        it("查询不存在的投资组合应该返回空数组", async function () {
            const [assets, lastUpdated] = await contract.getPortfolio(addr1.address);
            expect(assets.length).to.equal(0);
            expect(lastUpdated).to.equal(0);
        });
    });

    describe("删除投资组合", function () {
        beforeEach(async function () {
            const assets = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("50000"),
                },
            ];
            await contract.updatePortfolio(assets);
        });

        it("应该能够删除投资组合", async function () {
            await contract.deletePortfolio();

            const hasPortfolio = await contract.hasUserPortfolio(owner.address);
            expect(hasPortfolio).to.equal(false);

            const [assets] = await contract.getMyPortfolio();
            expect(assets.length).to.equal(0);
        });

        it("应该触发 PortfolioDeleted 事件", async function () {
            await expect(contract.deletePortfolio())
                .to.emit(contract, "PortfolioDeleted")
                .withArgs(owner.address, await getBlockTimestamp());
        });

        it("删除不存在的投资组合应该失败", async function () {
            await expect(contract.connect(addr1).deletePortfolio()).to.be.revertedWith(
                "No portfolio to delete"
            );
        });
    });

    describe("辅助功能", function () {
        beforeEach(async function () {
            const assets = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("50000"),
                },
                {
                    symbol: "ETH",
                    amount: ethers.parseEther("10"),
                    buyPrice: ethers.parseEther("3000"),
                },
            ];
            await contract.updatePortfolio(assets);
        });

        it("应该能够获取资产数量", async function () {
            const count = await contract.getAssetCount(owner.address);
            expect(count).to.equal(2);
        });

        it("应该能够获取单个资产", async function () {
            const asset = await contract.getAsset(owner.address, 0);
            expect(asset.symbol).to.equal("BTC");
            expect(asset.amount).to.equal(ethers.parseEther("1"));
        });

        it("获取无效索引应该失败", async function () {
            await expect(contract.getAsset(owner.address, 10)).to.be.revertedWith(
                "Invalid index"
            );
        });

        it("应该能够检查用户是否有投资组合", async function () {
            expect(await contract.hasUserPortfolio(owner.address)).to.equal(true);
            expect(await contract.hasUserPortfolio(addr1.address)).to.equal(false);
        });

        it("应该能够获取总用户数", async function () {
            expect(await contract.getTotalUsers()).to.equal(1);

            // 再添加一个用户
            const assets = [
                {
                    symbol: "USDT",
                    amount: ethers.parseEther("1000"),
                    buyPrice: ethers.parseEther("1"),
                },
            ];
            await contract.connect(addr1).updatePortfolio(assets);

            expect(await contract.getTotalUsers()).to.equal(2);
        });
    });

    describe("多用户场景", function () {
        it("不同用户的投资组合应该独立", async function () {
            // 用户 1 添加 BTC
            const assets1 = [
                {
                    symbol: "BTC",
                    amount: ethers.parseEther("1"),
                    buyPrice: ethers.parseEther("50000"),
                },
            ];
            await contract.connect(owner).updatePortfolio(assets1);

            // 用户 2 添加 ETH
            const assets2 = [
                {
                    symbol: "ETH",
                    amount: ethers.parseEther("10"),
                    buyPrice: ethers.parseEther("3000"),
                },
            ];
            await contract.connect(addr1).updatePortfolio(assets2);

            // 验证独立性
            const [ownerAssets] = await contract.getPortfolio(owner.address);
            const [addr1Assets] = await contract.getPortfolio(addr1.address);

            expect(ownerAssets.length).to.equal(1);
            expect(ownerAssets[0].symbol).to.equal("BTC");

            expect(addr1Assets.length).to.equal(1);
            expect(addr1Assets[0].symbol).to.equal("ETH");
        });
    });

    // 辅助函数
    async function getBlockTimestamp() {
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        return block.timestamp;
    }
});
