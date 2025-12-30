# Fluctuate Portfolio - TODO 清单

**最后更新**: 2025-12-30 22:09

---

## ✅ 已完成

### 文档部分
- [x] README.md 整理（简洁版）
- [x] docs/features.md（功能说明）
- [x] docs/architecture.md（技术架构）
- [x] docs/contract.md（智能合约设计）
- [x] docs/timeline.md（开发时间规划）
- [x] docs/submission.md（提交材料清单）
- [x] Git 仓库上传

### 智能合约部分
- [x] contracts 目录结构创建
- [x] FluctuatePortfolio.sol 合约代码
- [x] hardhat.config.js 配置（Mantle 测试网和主网）
- [x] deploy.js 部署脚本
- [x] FluctuatePortfolio.test.js 测试用例
- [x] contracts/README.md 开发指南
- [x] .env.example 模板
- [x] package.json 脚本配置

---

## 🔴 待办事项（按优先级）

### Phase 1: 智能合约部署（Day 1）

#### 1.1 在服务器上设置开发环境
```bash
cd /path/to/Fluctuate-Portfolio/contracts
npm install
```

#### 1.2 配置环境变量
```bash
cp .env.example .env
# 编辑 .env，填入私钥
```

**⚠️ 获取测试网 MNT:**
- 访问: https://faucet.testnet.mantle.xyz
- 或从 Sepolia 跨链桥接

#### 1.3 编译和测试合约
```bash
npm run compile
npm run test
```

#### 1.4 部署到 Mantle 测试网
```bash
npm run deploy:testnet
```

**预期输出:**
- 合约地址
- 部署交易哈希
- 区块链浏览器链接

#### 1.5 保存部署信息
- 记录合约地址到 `deployments/` 文件夹
- 更新 README.md 中的合约地址

---

### Phase 2: 前端项目初始化（Day 2）

#### 2.1 创建前端项目
```bash
cd /path/to/Fluctuate-Portfolio
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### 2.2 安装 Web3 依赖
```bash
npm install wagmi viem @rainbow-me/rainbowkit
npm install @tanstack/react-query
```

#### 2.3 安装 UI 框架
```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Shadcn/ui
npx shadcn-ui@latest init
```

#### 2.4 基础配置
- [ ] 配置 Tailwind CSS
- [ ] 设置 wagmi 和 RainbowKit
- [ ] 配置 Mantle 网络

---

### Phase 3: 核心功能开发（Day 3-6）

#### 3.1 钱包连接（Day 3）
- [ ] `components/ConnectWallet.tsx`
- [ ] RainbowKit 集成
- [ ] 测试 MetaMask 连接

#### 3.2 Chainlink 价格获取（Day 3-4）
- [ ] `hooks/useChainlinkPrice.ts`
- [ ] 配置价格 Feed 地址
- [ ] 测试 BTC/USD, ETH/USD, XAU/USD

**Chainlink Feeds 地址（需要查找）:**
- BTC/USD: 待确认
- ETH/USD: 待确认
- XAU/USD: 待确认

#### 3.3 资产管理（Day 5-6）
- [ ] `components/AssetList.tsx`
- [ ] `components/AddAssetModal.tsx`
- [ ] `components/EditAssetModal.tsx`
- [ ] `hooks/usePortfolio.ts`
- [ ] LocalStorage 集成

#### 3.4 数据可视化（Day 7）
- [ ] 安装 Recharts: `npm install recharts`
- [ ] `components/PortfolioSummary.tsx`
- [ ] `components/AssetDistribution.tsx`（饼图）
- [ ] 总净值计算逻辑

---

### Phase 4: 链上集成（Day 8-9）

#### 4.1 合约交互
- [ ] `hooks/useContract.ts`
- [ ] `hooks/useSaveToChain.ts`
- [ ] 读取链上投资组合
- [ ] 保存到链上功能

#### 4.2 数据同步
- [ ] 本地和链上数据同步策略
- [ ] 冲突检测和解决
- [ ] Gas 费估算显示

---

### Phase 5: 历史净值（Day 10）
- [ ] `components/NetWorthChart.tsx`
- [ ] 快照保存功能
- [ ] 时间范围选择器（7/30/90天）
- [ ] CSV 导出功能

---

### Phase 6: UI/UX 优化（Day 11）
- [ ] 响应式设计（移动端）
- [ ] 深色模式
- [ ] 加载状态优化
- [ ] 错误提示优化
- [ ] 空状态设计

---

### Phase 7: 测试和部署（Day 12-14）

#### 7.1 测试（Day 12）
- [ ] 功能测试
- [ ] 跨浏览器测试
- [ ] 移动端测试
- [ ] Bug 修复

#### 7.2 文档和视频（Day 13）
- [ ] 完善 README
- [ ] 录制演示视频（3-5分钟）
- [ ] 制作 Pitch Deck

#### 7.3 部署（Day 14）
- [ ] 前端部署到 Vercel
- [ ] 合约部署到 Mantle 主网（可选）
- [ ] 最终测试
- [ ] 提交到 HackQuest

---

## 📋 开发检查清单

### 每日目标
- [ ] 代码 commit 到 GitHub
- [ ] 更新 TODO.md 进度
- [ ] 记录遇到的问题和解决方案

### 每周检查
- [ ] Week 1: 合约 + 基础前端
- [ ] Week 2: 完整功能 + 提交

---

## 🔗 重要链接

### Mantle 相关
- 测试网 RPC: https://rpc.testnet.mantle.xyz
- 测试网浏览器: https://sepolia.mantlescan.xyz
- 水龙头: https://faucet.testnet.mantle.xyz
- 文档: https://docs.mantle.xyz

### Chainlink 相关
- Price Feeds: https://docs.chain.link/data-feeds/price-feeds
- Mantle 集成: https://docs.chain.link/data-feeds/price-feeds/addresses?network=mantle

### 开发工具
- Hardhat 文档: https://hardhat.org/docs
- wagmi 文档: https://wagmi.sh
- RainbowKit: https://www.rainbowkit.com
- Shadcn/ui: https://ui.shadcn.com

---

## ⚠️ 注意事项

1. **私钥安全**
   - 绝对不要将 `.env` 提交到 Git
   - 使用测试网账户，不要用主网私钥

2. **Gas 费用**
   - 确保测试网账户有足够的 MNT
   - 部署合约前先在本地测试

3. **Chainlink Feeds**
   - 验证 Mantle 上可用的 Price Feeds
   - 可能需要备用价格 API

4. **时间管理**
   - 优先 MVP 功能
   - 加分功能可以后做

---

## 🎯 当前优先级

**今天（Day 1）必须完成:**
1. ✅ 在服务器上成功编译合约
2. ✅ 运行测试，确保所有测试通过
3. ✅ 部署到 Mantle 测试网
4. ✅ 验证合约

**明天（Day 2）目标:**
1. 初始化前端项目
2. 配置 wagmi + RainbowKit
3. 实现钱包连接

---

## 💡 在服务器上开发建议

### 快速开始命令
```bash
# 1. 进入项目目录
cd Fluctuate-Portfolio/contracts

# 2. 安装依赖（如果是 Linux 服务器应该没问题）
npm install

# 3. 编译合约
npm run compile

# 4. 运行测试
npm run test

# 5. 配置私钥
nano .env
# 填入: PRIVATE_KEY=0x你的私钥

# 6. 部署到测试网
npm run deploy:testnet
```

### 常见问题处理

**如果 npm install 失败:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**如果编译报错:**
```bash
npm run clean
npm run compile
```

---

## 📝 进度更新

记得在每个阶段完成后，把  `[ ]` 改成 `[x]`！

**加油！我们的目标是 2 周内完成一个优秀的 Hackathon 项目！** 🚀
