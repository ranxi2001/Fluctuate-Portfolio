export const FLUCTUATE_PORTFOLIO_ABI = [
  {
    type: 'function',
    name: 'updatePortfolio',
    inputs: [
      {
        name: '_assets',
        type: 'tuple[]',
        components: [
          { name: 'symbol', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'buyPrice', type: 'uint256' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPortfolio',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        name: 'assets',
        type: 'tuple[]',
        components: [
          { name: 'symbol', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'buyPrice', type: 'uint256' },
        ],
      },
      { name: 'lastUpdated', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMyPortfolio',
    inputs: [],
    outputs: [
      {
        name: 'assets',
        type: 'tuple[]',
        components: [
          { name: 'symbol', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'buyPrice', type: 'uint256' },
        ],
      },
      { name: 'lastUpdated', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deletePortfolio',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAsset',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'asset',
        type: 'tuple',
        components: [
          { name: 'symbol', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'buyPrice', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAssetCount',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'count', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasUserPortfolio',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'exists', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalUsers',
    inputs: [],
    outputs: [{ name: 'count', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUsers',
    inputs: [
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    outputs: [{ name: 'userList', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'PortfolioUpdated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'assetCount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PortfolioDeleted',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const
