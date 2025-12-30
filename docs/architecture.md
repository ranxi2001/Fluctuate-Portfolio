# 技术架构设计

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React 前端应用                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │  UI 组件    │  │  状态管理     │  │  数据可视化 │  │   │
│  │  │  (Shadcn)   │  │  (Hooks)     │  │  (Recharts) │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         Web3 层 (wagmi + viem)                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────┬───────────────────────────────────────┬──┘
                    │                                       │
          ┌─────────▼─────────┐                   ┌────────▼─────────┐
          │   MetaMask 钱包    │                   │  LocalStorage    │
          └─────────┬─────────┘                   └──────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐      ┌───────▼────────────┐
│ Mantle Network │      │ Chainlink Oracles  │
│  ┌──────────┐  │      │  ┌──────────────┐  │
│  │Portfolio │  │      │  │ Price Feeds  │  │
│  │ Contract │  │      │  │  BTC/USD     │  │
│  └──────────┘  │      │  │  ETH/USD     │  │
│                │      │  │  XAU/USD     │  │
└────────────────┘      │  └──────────────┘  │
                        └────────────────────┘
```

---

## 前端架构

### 技术选型

#### 核心框架
- **React 18**：现代化的 UI 框架
- **TypeScript**：类型安全
- **Vite**：快速的构建工具

#### Web3 集成
- **wagmi v2**：React Hooks for Ethereum
- **viem**：轻量级 Ethereum 库
- **RainbowKit**：美观的钱包连接 UI

#### UI 框架
- **Tailwind CSS**：原子化 CSS
- **Shadcn/ui**：可定制的组件库
- **Lucide Icons**：美观的图标库

#### 数据可视化
- **Recharts**：React 图表库
  - 折线图（历史净值）
  - 饼图（资产分布）

### 目录结构

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # 头部导航
│   │   ├── Footer.tsx           # 页脚
│   │   └── Layout.tsx           # 布局容器
│   ├── wallet/
│   │   ├── ConnectWallet.tsx    # 钱包连接按钮
│   │   └── WalletInfo.tsx       # 钱包信息显示
│   ├── portfolio/
│   │   ├── AssetList.tsx        # 资产列表
│   │   ├── AddAssetModal.tsx    # 添加资产弹窗
│   │   ├── EditAssetModal.tsx   # 编辑资产弹窗
│   │   └── AssetCard.tsx        # 单个资产卡片
│   ├── dashboard/
│   │   ├── PortfolioSummary.tsx # 总览卡片
│   │   ├── AssetDistribution.tsx# 资产分布饼图
│   │   └── NetWorthChart.tsx    # 净值曲线
│   └── ui/
│       ├── button.tsx           # 按钮组件
│       ├── card.tsx             # 卡片组件
│       ├── dialog.tsx           # 对话框组件
│       └── ...                  # 其他 Shadcn 组件
├── hooks/
│   ├── usePortfolio.ts          # 投资组合数据管理
│   ├── useChainlinkPrice.ts     # Chainlink 价格获取
│   ├── useLocalStorage.ts       # 本地存储
│   └── useContract.ts           # 合约交互
├── utils/
│   ├── chainlinkFeeds.ts        # Chainlink 地址配置
│   ├── assetTypes.ts            # 资产类型定义
│   ├── calculations.ts          # 计算工具函数
│   └── formatters.ts            # 格式化工具
├── types/
│   ├── asset.ts                 # 资产类型定义
│   ├── portfolio.ts             # 投资组合类型
│   └── price.ts                 # 价格数据类型
├── lib/
│   ├── wagmi.ts                 # wagmi 配置
│   └── constants.ts             # 常量定义
├── App.tsx                      # 主应用
└── main.tsx                     # 入口文件
```

### 数据流

```
用户操作
    ↓
React 组件
    ↓
自定义 Hooks (usePortfolio, useChainlinkPrice)
    ↓
┌─────────────────┬─────────────────┐
│  LocalStorage   │  Smart Contract │
└─────────────────┴─────────────────┘
```

---

## 智能合约架构

### 合约设计

```solidity
contract FluctuatePortfolio {
    // 资产结构
    struct Asset {
        string symbol;      // 资产符号
        uint256 amount;     // 持有数量（18位精度）
        uint256 buyPrice;   // 购入价格（可选）
    }
    
    // 投资组合结构
    struct Portfolio {
        Asset[] assets;
        uint256 lastUpdated;
    }
    
    // 用户投资组合映射
    mapping(address => Portfolio) public portfolios;
    
    // 更新投资组合
    function updatePortfolio(Asset[] calldata _assets) external;
    
    // 获取投资组合
    function getPortfolio(address user) external view 
        returns (Asset[] memory, uint256);
}
```

### Gas 优化策略

1. **批量更新**：一次交易更新所有资产
2. **事件日志**：使用 event 记录历史，减少存储
3. **精简数据**：只存储必要字段
4. **Mantle L2**：利用低 gas 费优势

---

## Chainlink 集成

### Price Feeds 地址（Mantle Testnet）

| 交易对 | 地址 | 精度 |
|--------|------|------|
| BTC/USD | `0x...` | 8 decimals |
| ETH/USD | `0x...` | 8 decimals |
| XAU/USD | `0x...` | 8 decimals |

### 获取价格示例

```typescript
// hooks/useChainlinkPrice.ts
import { useContractRead } from 'wagmi';
import { CHAINLINK_BTC_USD } from '@/lib/constants';

const ABI = [
  {
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' }
    ]
  }
];

export function useChainlinkPrice(symbol: string) {
  const { data } = useContractRead({
    address: CHAINLINK_BTC_USD,
    abi: ABI,
    functionName: 'latestRoundData'
  });
  
  if (!data) return null;
  
  const price = Number(data.answer) / 1e8; // 转换精度
  return price;
}
```

---

## 数据持久化策略

### 本地存储（LocalStorage）

```typescript
// hooks/useLocalStorage.ts
export function usePortfolioStorage() {
  const save = (portfolio: Portfolio) => {
    localStorage.setItem(
      `portfolio_${address}`,
      JSON.stringify(portfolio)
    );
  };
  
  const load = (): Portfolio | null => {
    const data = localStorage.getItem(`portfolio_${address}`);
    return data ? JSON.parse(data) : null;
  };
  
  return { save, load };
}
```

### 链上存储（Smart Contract）

```typescript
// hooks/useContract.ts
export function useSaveToChain() {
  const { writeAsync } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'updatePortfolio'
  });
  
  const saveToChain = async (assets: Asset[]) => {
    const tx = await writeAsync({ args: [assets] });
    await tx.wait();
  };
  
  return { saveToChain };
}
```

### 混合存储策略

1. **写入**：先写本地（即时），用户手动触发上链
2. **读取**：优先本地，本地无数据时从链上加载
3. **同步**：检测链上数据更新时间，提示用户同步

---

## 部署架构

```
┌──────────────────┐
│   GitHub Repo    │
└────────┬─────────┘
         │
    ┌────▼────┐
    │  Vercel │  (自动部署前端)
    └────┬────┘
         │
    生成静态文件
         │
    ┌────▼────────────┐
    │   CDN 分发       │
    └─────────────────┘

┌──────────────────┐
│  Hardhat 脚本    │
└────────┬─────────┘
         │
    ┌────▼────────────┐
    │ Mantle Testnet  │  (部署合约)
    └────┬────────────┘
         │
    验证后部署
         │
    ┌────▼────────────┐
    │ Mantle Mainnet  │
    └─────────────────┘
```

---

## 性能优化

### 前端优化
- 代码分割（React.lazy）
- 图片懒加载
- 防抖/节流（价格更新）
- 虚拟列表（资产数量过多时）

### 合约优化
- 使用事件代替存储（历史记录）
- 批量操作减少交易次数
- 合理使用 view/pure 函数

### 网络优化
- 缓存 Chainlink 价格（5分钟）
- 使用 SWR 或 React Query
- WebSocket 实时更新（可选）

---

## 安全考虑

### 前端安全
- XSS 防护（React 自动转义）
- 输入验证（资产数量、价格）
- 安全的 localStorage 使用

### 合约安全
- 重入攻击防护（ReentrancyGuard）
- 仅允许用户修改自己的数据
- 事件日志完整记录

### 钱包安全
- 明确显示交易内容
- Gas 费用预估
- 网络检测和提示
