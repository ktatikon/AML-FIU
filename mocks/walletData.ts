import { Token, Transaction, Wallet } from '@/types/wallet';

export const mockTokens: Token[] = [
  {
    id: '1',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '1.245',
    value: 3245.67,
    change24h: 2.34,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    id: '2',
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: '0.0345',
    value: 1567.89,
    change24h: -1.2,
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  {
    id: '3',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '1250.00',
    value: 1250.00,
    change24h: 0.01,
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  {
    id: '4',
    symbol: 'LINK',
    name: 'Chainlink',
    balance: '45.75',
    value: 567.30,
    change24h: 5.67,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    amount: '0.5',
    token: 'ETH',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    status: 'completed',
  },
  {
    id: '2',
    type: 'send',
    amount: '0.1',
    token: 'ETH',
    address: '0x8C8D7C46219D9205f056f28fee5950aD564d7465',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    status: 'completed',
    amlStatus: 'approved',
  },
  {
    id: '3',
    type: 'send',
    amount: '0.05',
    token: 'BTC',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    status: 'completed',
    amlStatus: 'flagged',
  },
  {
    id: '4',
    type: 'swap',
    amount: '100',
    token: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    status: 'completed',
  },
  {
    id: '5',
    type: 'send',
    amount: '10',
    token: 'LINK',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    status: 'failed',
    amlStatus: 'blocked',
  },
];

export const mockWallet: Wallet = {
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  name: 'Main Wallet',
  totalBalance: 6630.86,
  tokens: mockTokens,
  transactions: mockTransactions,
};