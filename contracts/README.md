# 智能合约开发指南

## 快速开始

### 1. 安装依赖

```bash
cd contracts
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的私钥：

```bash
cp .env.example .env
```

编辑 `.env`：
```
PRIVATE_KEY=0x你的私钥（从MetaMask导出）
```

**⚠️ 重要：** 
- 绝对不要将 `.env` 文件提交到 Git
- 使用测试网账户的私钥，不要使用主网账户
- 确保账户有足够的测试网 MNT（可从水龙头获取）

### 3. 编译合约

```bash
npx hardhat compile
```

### 4. 运行测试

```bash
npx hardhat test
```

查看测试覆盖率：
```bash
npx hardhat coverage
```

### 5. 部署到本地网络（测试）

```bash
# 启动本地节点
npx hardhat node

# 在另一个终端部署
npx hardhat run scripts/deploy.js --network localhost
```

### 6. 部署到 Mantle 测试网

```bash
npx hardhat run scripts/deploy.js --network mantleTestnet
```

### 7. 验证合约（可选）

部署脚本会自动验证，如果失败可以手动验证：

```bash
npx hardhat verify --network mantleTestnet <合约地址>
```

---

## 获取测试网 MNT

### 方法 1: Mantle 官方水龙头
访问：https://faucet.testnet.mantle.xyz

### 方法 2: 跨链桥
从 Sepolia 桥接到 Mantle Sepolia

---

## 项目结构

```
contracts/
├── contracts/
│   └── FluctuatePortfolio.sol    # 主合约
├── scripts/
│   └── deploy.js                  # 部署脚本
├── test/
│   └── FluctuatePortfolio.test.js # 测试文件
├── deployments/                   # 部署记录（自动生成）
├── hardhat.config.js              # Hardhat 配置
├── .env.example                   # 环境变量模板
└── package.json
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npx hardhat compile` | 编译合约 |
| `npx hardhat test` | 运行测试 |
| `npx hardhat clean` | 清理编译产物 |
| `npx hardhat node` | 启动本地节点 |
| `npx hardhat console --network mantleTestnet` | 交互式控制台 |

---

## 合约交互示例

在 Hardhat 控制台中：

```javascript
// 连接到已部署的合约
const contract = await ethers.getContractAt(
  "FluctuatePortfolio",
  "0x合约地址"
);

// 查看投资组合
const [assets, lastUpdated] = await contract.getMyPortfolio();
console.log(assets);

// 更新投资组合
const assets = [
  {
    symbol: "BTC",
    amount: ethers.parseEther("1.5"),
    buyPrice: ethers.parseEther("50000")
  }
];
await contract.updatePortfolio(assets);
```

---

## Gas 优化建议

已实施的优化：
- ✅ 使用 `calldata` 代替 `memory`
- ✅ 批量操作减少交易次数
- ✅ 合理使用事件记录历史
- ✅ 删除数据获得 gas 退款

---

## 安全检查清单

- [x] 重入攻击防护
- [x] 整数溢出检查（Solidity 0.8.x 自带）
- [x] 访问控制（用户只能修改自己的数据）
- [x] 输入验证
- [x] DOS 攻击防护（限制数组大小）

---

## 下一步

1. ✅ 在本地测试网测试所有功能
2. ✅ 部署到 Mantle 测试网
3. ⏳ 前端集成
4. ⏳ 部署到 Mantle 主网

---

## 需要帮助？

- Hardhat 文档: https://hardhat.org/docs
- Mantle 文档: https://docs.mantle.xyz
- Ethers.js 文档: https://docs.ethers.org
