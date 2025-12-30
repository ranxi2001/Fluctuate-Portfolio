# 🚀 Deployment Instructions

这份文档提供了部署 **Fluctuate Portfolio** 的完整指南，包括智能合约部署到 Mantle 网络以及前端应用的发布。

## 📋 目录

1. [前置要求](#1-前置要求)
2. [智能合约部署 (Back-end)](#2-智能合约部署-foundry)
3. [前端应用部署 (Front-end)](#3-前端应用部署)
4. [合约验证](#4-合约验证)
5. [常见问题](#5-常见问题)

---

## 1. 前置要求

在开始之前，请确保你的开发环境安装了以下工具：

- **Git**: 版本控制工具
- **Node.js** (v18+): 前端运行环境
- **Foundry**: 智能合约开发框架
- **MetaMask**: 浏览器钱包插件（建议创建一个专用的开发账户）
- **Mantle Testnet MNT**: 用于支付 Gas 费用 ([领取水龙头](https://faucet.sepolia.mantle.xyz/))

### 安装 Foundry

如果尚未安装 Foundry，请运行以下命令：

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## 2. 智能合约部署 (Foundry)

本项目使用 **Foundry** 进行智能合约的开发、测试和部署。

### 2.1 环境配置

1. 进入合约目录：
   ```bash
   cd foundry
   ```

2. 配置环境变量：
   复制示例文件并创建 `.env`：
   ```bash
   cp .env.example .env
   ```

3. 编辑 `.env` 文件，填入你的私钥和 RPC 地址：
   ```ini
   # 部署账户的私钥 (不带 0x 前缀)
   PRIVATE_KEY=your_private_key_here

   # Mantle Sepolia 测试网 RPC
   MANTLE_TESTNET_RPC_URL=https://rpc.sepolia.mantle.xyz
   
   # Mantle Mainnet 主网 RPC (生产环境用)
   MANTLE_MAINNET_RPC_URL=https://rpc.mantle.xyz
   ```

### 2.2 编译与测试

在部署前，确保合约通过所有测试：

```bash
# 编译合约
forge build

# 运行测试
forge test

# (可选) 查看详细 Gas 报告
forge test --gas-report
```

### 2.3 部署到 Mantle Sepolia 测试网

运行以下命令执行部署脚本：

```bash
# 加载环境变量
source .env

# 执行部署脚本
forge script script/Deploy.s.sol:DeployFluctuatePortfolio \
    --rpc-url $MANTLE_TESTNET_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast
```

**部署成功后，你将看到类似以下的输出：**

```text
Contract address: 0xa37C...
Transaction hash: 0xc81f...
```

⚠️ **重要**：请务必保存好生成的 `Contract Address`，前端配置需要用到它。

---

## 3. 前端应用部署

前端基于 React + Vite 构建，推荐使用 **Vercel** 进行一键部署。

### 3.1 本地开发

1. 回到项目根目录并安装依赖：
   ```bash
   npm install
   ```

2. 启动本地开发服务器：
   ```bash
   npm run dev
   ```

### 3.2 生产环境构建

构建用于生产的静态文件：

```bash
npm run build
```

### 3.3 部署到 Vercel (推荐)

1. 安装 Vercel CLI (可选，也可通过网页端导入)：
   ```bash
   npm i -g vercel
   ```

2. 登录并部署：
   ```bash
   vercel
   ```

3. **配置环境变量** (在 Vercel Dashboard 中设置)：
   
   | 变量名 | 描述 | 示例值 |
   |--------|------|--------|
   | `VITE_CONTRACT_ADDRESS` | 你的合约地址 | `0xa37C...` |
   | `VITE_CHAIN_ID` | 链 ID | `5003` (Testnet) |
   | `VITE_RPC_URL` | RPC 节点 | `https://rpc.sepolia.mantle.xyz` |

---

## 4. 合约验证

为了让用户在区快链浏览器上查看源码，建议验证你的合约。

Mantle Sepolia 验证命令：

```bash
cd foundry

forge verify-contract <合约地址> FluctuatePortfolio \
    --chain-id 5003 \
    --watch \
    --verifier-url https://api-sepolia.mantlescan.xyz/api
```

验证成功后，访问 [Mantle Sepolia Explorer](https://sepolia.mantlescan.xyz/) 并搜索你的合约地址，即可看到绿色验证对勾。

---

## 5. 提交清单 (Hackathon Checklist)

确保在提交前完成以下事项：

- [ ] **GitHub Repo**: 代码已推送到公开仓库。
- [ ] **README**: 包含项目简介、功能列表和演示链接。
- [ ] **部署文档**: 包含本文档 (`docs/deployment.md`)。
- [ ] **已部署合约**: 在 Mantle Testnet 上验证并公开合约地址。
- [ ] **演示视频**: 录制 3-5 分钟的核心功能演示。
- [ ] **Live Demo**: 提供 Vercel 部署的在线访问链接。

---

**Happy Hacking! 🚀**
