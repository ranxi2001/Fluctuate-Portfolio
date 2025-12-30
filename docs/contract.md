# 智能合约设计文档

## 合约概述

**FluctuatePortfolio** 是一个轻量级的链上资产组合存储合约，部署在 Mantle 网络上。

### 合约地址

- **Mantle Testnet**: `0x...` (待部署)
- **Mantle Mainnet**: `0x...` (待部署)

---

## 合约完整代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FluctuatePortfolio
 * @dev 去中心化资产组合存储合约
 * @notice 用户可以存储和检索自己的资产配置信息
 */
contract FluctuatePortfolio {
    
    // ============ 数据结构 ============
    
    /**
     * @dev 单个资产结构
     * @param symbol 资产符号（如 "BTC", "ETH", "XAU"）
     * @param amount 持有数量（使用 18 位小数精度）
     * @param buyPrice 购入价格（可选，18 位小数精度）
     */
    struct Asset {
        string symbol;
        uint256 amount;
        uint256 buyPrice;
    }
    
    /**
     * @dev 投资组合结构
     * @param assets 资产数组
     * @param lastUpdated 最后更新时间戳
     */
    struct Portfolio {
        Asset[] assets;
        uint256 lastUpdated;
    }
    
    // ============ 状态变量 ============
    
    /// @notice 用户地址到投资组合的映射
    mapping(address => Portfolio) private portfolios;
    
    /// @notice 记录所有更新过投资组合的用户地址
    address[] private users;
    
    /// @notice 判断用户是否已经创建过投资组合
    mapping(address => bool) private hasPortfolio;
    
    // ============ 事件 ============
    
    /**
     * @dev 投资组合更新事件
     * @param user 用户地址
     * @param assetCount 资产数量
     * @param timestamp 更新时间戳
     */
    event PortfolioUpdated(
        address indexed user,
        uint256 assetCount,
        uint256 timestamp
    );
    
    /**
     * @dev 投资组合删除事件
     * @param user 用户地址
     * @param timestamp 删除时间戳
     */
    event PortfolioDeleted(
        address indexed user,
        uint256 timestamp
    );
    
    // ============ 主要功能 ============
    
    /**
     * @notice 更新用户的投资组合
     * @dev 会覆盖之前的所有资产数据
     * @param _assets 新的资产数组
     */
    function updatePortfolio(Asset[] calldata _assets) external {
        require(_assets.length > 0, "Portfolio cannot be empty");
        require(_assets.length <= 50, "Too many assets (max 50)");
        
        // 记录首次创建的用户
        if (!hasPortfolio[msg.sender]) {
            users.push(msg.sender);
            hasPortfolio[msg.sender] = true;
        }
        
        Portfolio storage portfolio = portfolios[msg.sender];
        
        // 清空旧数据
        delete portfolio.assets;
        
        // 添加新资产
        for (uint256 i = 0; i < _assets.length; i++) {
            require(bytes(_assets[i].symbol).length > 0, "Symbol cannot be empty");
            require(_assets[i].amount > 0, "Amount must be greater than 0");
            
            portfolio.assets.push(_assets[i]);
        }
        
        portfolio.lastUpdated = block.timestamp;
        
        emit PortfolioUpdated(msg.sender, _assets.length, block.timestamp);
    }
    
    /**
     * @notice 获取指定用户的投资组合
     * @param user 用户地址
     * @return assets 资产数组
     * @return lastUpdated 最后更新时间
     */
    function getPortfolio(address user) 
        external 
        view 
        returns (Asset[] memory assets, uint256 lastUpdated) 
    {
        Portfolio storage portfolio = portfolios[user];
        return (portfolio.assets, portfolio.lastUpdated);
    }
    
    /**
     * @notice 获取当前用户的投资组合
     * @return assets 资产数组
     * @return lastUpdated 最后更新时间
     */
    function getMyPortfolio() 
        external 
        view 
        returns (Asset[] memory assets, uint256 lastUpdated) 
    {
        Portfolio storage portfolio = portfolios[msg.sender];
        return (portfolio.assets, portfolio.lastUpdated);
    }
    
    /**
     * @notice 删除当前用户的投资组合
     */
    function deletePortfolio() external {
        require(hasPortfolio[msg.sender], "No portfolio to delete");
        
        delete portfolios[msg.sender];
        hasPortfolio[msg.sender] = false;
        
        emit PortfolioDeleted(msg.sender, block.timestamp);
    }
    
    /**
     * @notice 获取单个资产信息
     * @param user 用户地址
     * @param index 资产索引
     * @return asset 资产信息
     */
    function getAsset(address user, uint256 index)
        external
        view
        returns (Asset memory asset)
    {
        Portfolio storage portfolio = portfolios[user];
        require(index < portfolio.assets.length, "Invalid index");
        return portfolio.assets[index];
    }
    
    /**
     * @notice 获取投资组合中的资产数量
     * @param user 用户地址
     * @return count 资产数量
     */
    function getAssetCount(address user) 
        external 
        view 
        returns (uint256 count) 
    {
        return portfolios[user].assets.length;
    }
    
    /**
     * @notice 检查用户是否有投资组合
     * @param user 用户地址
     * @return exists 是否存在
     */
    function hasUserPortfolio(address user) 
        external 
        view 
        returns (bool exists) 
    {
        return hasPortfolio[user];
    }
    
    /**
     * @notice 获取所有用户数量
     * @return count 用户数量
     */
    function getTotalUsers() external view returns (uint256 count) {
        return users.length;
    }
    
    /**
     * @notice 批量获取用户地址（分页）
     * @param offset 起始索引
     * @param limit 获取数量
     * @return userList 用户地址数组
     */
    function getUsers(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory userList)
    {
        require(offset < users.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > users.length) {
            end = users.length;
        }
        
        userList = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            userList[i - offset] = users[i];
        }
        
        return userList;
    }
}
```

---

## 功能说明

### 核心功能

| 函数 | 描述 | 可见性 | Gas 估算 |
|------|------|--------|----------|
| `updatePortfolio` | 更新投资组合 | external | ~100k-300k |
| `getPortfolio` | 查询用户投资组合 | view | 0 |
| `getMyPortfolio` | 查询自己的投资组合 | view | 0 |
| `deletePortfolio` | 删除投资组合 | external | ~30k |

### 辅助功能

| 函数 | 描述 |
|------|------|
| `getAsset` | 获取单个资产 |
| `getAssetCount` | 获取资产数量 |
| `hasUserPortfolio` | 检查是否有投资组合 |
| `getTotalUsers` | 获取总用户数 |
| `getUsers` | 分页获取用户列表 |

---

## 数据结构设计

### Asset 结构

```solidity
struct Asset {
    string symbol;      // 资产符号，如 "BTC"
    uint256 amount;     // 持有数量（18位精度）
    uint256 buyPrice;   // 购入价格（18位精度，可选）
}
```

**示例**：
```javascript
// 持有 1.5 BTC，成本价 $50,000
{
  symbol: "BTC",
  amount: "1500000000000000000",  // 1.5 * 10^18
  buyPrice: "50000000000000000000000"  // 50000 * 10^18
}
```

### Portfolio 结构

```solidity
struct Portfolio {
    Asset[] assets;         // 资产数组
    uint256 lastUpdated;    // 最后更新时间戳
}
```

---

## 事件定义

### PortfolioUpdated

```solidity
event PortfolioUpdated(
    address indexed user,
    uint256 assetCount,
    uint256 timestamp
);
```

**用途**：记录投资组合更新历史，可用于：
- 监听用户更新行为
- 构建历史净值曲线
- 数据分析

### PortfolioDeleted

```solidity
event PortfolioDeleted(
    address indexed user,
    uint256 timestamp
);
```

**用途**：记录删除操作

---

## Gas 优化策略

### 1. 批量更新
一次交易更新所有资产，而非逐个更新

### 2. 使用 calldata
```solidity
function updatePortfolio(Asset[] calldata _assets)
```
`calldata` 比 `memory` 更省 gas

### 3. 事件代替存储
用事件记录历史，减少链上存储

### 4. 限制数组大小
```solidity
require(_assets.length <= 50, "Too many assets");
```

### 5. 删除旧数据
```solidity
delete portfolio.assets; // 清空旧数据，获得 gas 退款
```

---

## 安全考虑

### 1. 访问控制
- 用户只能修改自己的数据
- `msg.sender` 作为唯一标识

### 2. 输入验证
```solidity
require(_assets.length > 0, "Portfolio cannot be empty");
require(bytes(_assets[i].symbol).length > 0, "Symbol cannot be empty");
require(_assets[i].amount > 0, "Amount must be greater than 0");
```

### 3. 防止 DOS
限制资产数量上限（50个）

### 4. 整数溢出
使用 Solidity ^0.8.0 自带的溢出检查

---

## 部署脚本

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying FluctuatePortfolio...");
  
  const FluctuatePortfolio = await hre.ethers.getContractFactory("FluctuatePortfolio");
  const contract = await FluctuatePortfolio.deploy();
  
  await contract.deployed();
  
  console.log("FluctuatePortfolio deployed to:", contract.address);
  
  // 验证合约（Mantle Testnet）
  if (hre.network.name === "mantleTestnet") {
    console.log("Waiting for block confirmations...");
    await contract.deployTransaction.wait(5);
    
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## 测试用例

```javascript
// test/FluctuatePortfolio.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FluctuatePortfolio", function () {
  let contract;
  let owner;
  
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const FluctuatePortfolio = await ethers.getContractFactory("FluctuatePortfolio");
    contract = await FluctuatePortfolio.deploy();
    await contract.deployed();
  });
  
  it("Should update portfolio", async function () {
    const assets = [
      {
        symbol: "BTC",
        amount: ethers.utils.parseEther("1.5"),
        buyPrice: ethers.utils.parseEther("50000")
      }
    ];
    
    await contract.updatePortfolio(assets);
    
    const [retrievedAssets, lastUpdated] = await contract.getMyPortfolio();
    expect(retrievedAssets.length).to.equal(1);
    expect(retrievedAssets[0].symbol).to.equal("BTC");
  });
  
  it("Should delete portfolio", async function () {
    const assets = [
      {
        symbol: "ETH",
        amount: ethers.utils.parseEther("10"),
        buyPrice: ethers.utils.parseEther("3000")
      }
    ];
    
    await contract.updatePortfolio(assets);
    await contract.deletePortfolio();
    
    const hasPortfolio = await contract.hasUserPortfolio(owner.address);
    expect(hasPortfolio).to.equal(false);
  });
});
```

---

## 与前端集成

### 读取投资组合

```typescript
import { useContractRead } from 'wagmi';

export function useGetPortfolio(address: string) {
  const { data, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPortfolio',
    args: [address],
  });
  
  return { portfolio: data, isLoading };
}
```

### 更新投资组合

```typescript
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

export function useSavePortfolio() {
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'updatePortfolio',
  });
  
  const { writeAsync, isLoading } = useContractWrite(config);
  
  const save = async (assets: Asset[]) => {
    const tx = await writeAsync({ args: [assets] });
    await tx.wait();
  };
  
  return { save, isLoading };
}
```

---

## 未来扩展

### 版本 2.0 功能
- [ ] 支持多个投资组合（命名保存）
- [ ] 资产快照历史（链上存储多个版本）
- [ ] 共享投资组合（公开/私密链接）
- [ ] 投资组合模板市场

### 版本 3.0 功能
- [ ] NFT 化投资组合
- [ ] 跨链同步（Optimism, Arbitrum）
- [ ] DAO 治理（社区投票功能）
