import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { type Chain } from 'viem'

// Custom Mantle chains
const mantleTestnet: Chain = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://sepolia.mantlescan.xyz' },
  },
  testnet: true,
}

const mantleMainnet: Chain = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://mantlescan.xyz' },
  },
  testnet: false,
}

// WalletConnect Project ID - Get one at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo'

export const config = createConfig({
  chains: [mantleTestnet, mantleMainnet, mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mantleTestnet.id]: http(),
    [mantleMainnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export { mantleTestnet, mantleMainnet }
