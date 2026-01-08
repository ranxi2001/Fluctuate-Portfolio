// Mantle Network Configuration
export const MANTLE_TESTNET = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
    public: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://sepolia.mantlescan.xyz' },
  },
  testnet: true,
} as const

export const MANTLE_MAINNET = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
    public: { http: ['https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://mantlescan.xyz' },
  },
  testnet: false,
} as const

// Contract Address - Deployed on Mantle Sepolia Testnet
export const CONTRACT_ADDRESS = '0xa37CD611Ff745548926b7ed121Ba825A61226149' as const

// Chainlink Price Feed Addresses on Mantle (placeholder - update with actual addresses)
export const CHAINLINK_FEEDS = {
  'BTC/USD': '0x0000000000000000000000000000000000000000',
  'ETH/USD': '0x0000000000000000000000000000000000000000',
  'XAU/USD': '0x0000000000000000000000000000000000000000',
} as const

// Supported Assets Configuration with icon URLs
export const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', category: 'crypto', decimals: 8, hasPriceFeed: true, icon: 'https://cryptoicons.org/api/icon/btc/96' },
  { symbol: 'ETH', name: 'Ethereum', category: 'crypto', decimals: 18, hasPriceFeed: true, icon: 'https://cryptoicons.org/api/icon/eth/96' },
  { symbol: 'USDT', name: 'Tether USD', category: 'stablecoin', decimals: 6, hasPriceFeed: false, fixedPrice: 1, icon: 'https://cryptoicons.org/api/icon/usdt/96' },
  { symbol: 'USDC', name: 'USD Coin', category: 'stablecoin', decimals: 6, hasPriceFeed: false, fixedPrice: 1, icon: 'https://cryptoicons.org/api/icon/usdc/96' },
  { symbol: 'XAU', name: 'Gold', category: 'rwa', decimals: 8, hasPriceFeed: true, icon: 'https://img.icons8.com/color/96/gold-bars.png' },
  { symbol: 'USD', name: 'US Dollar', category: 'fiat', decimals: 2, hasPriceFeed: false, fixedPrice: 1, icon: 'https://img.icons8.com/color/96/us-dollar-circled.png' },
  { symbol: 'CNY', name: 'Chinese Yuan', category: 'fiat', decimals: 2, hasPriceFeed: false, fixedPrice: 0.14, icon: 'https://img.icons8.com/color/96/yuan.png' },
] as const

// Asset Categories
export const ASSET_CATEGORIES = {
  crypto: { label: 'Cryptocurrency', color: '#6366f1' },
  stablecoin: { label: 'Stablecoin', color: '#22c55e' },
  rwa: { label: 'Real World Asset', color: '#f59e0b' },
  fiat: { label: 'Fiat Currency', color: '#64748b' },
  custom: { label: 'Custom Asset', color: '#8b5cf6' },
} as const

// Chart Colors
export const CHART_COLORS = [
  '#6366f1', // primary
  '#22c55e', // success
  '#f59e0b', // warning
  '#ef4444', // error
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
]
