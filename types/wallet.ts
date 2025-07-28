export interface Token {
    id: string;
    symbol: string;
    name: string;
    balance: string;
    value: number;
    change24h: number;
    logo: string;
  }
  
  export type AmlStatus = 'approved' | 'flagged' | 'blocked';
  
  export interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'swap';
    amount: string;
    token: string;
    address: string;
    timestamp: number;
    status: 'pending' | 'completed' | 'failed';
    amlStatus?: AmlStatus;
  }
  
  export interface Wallet {
    address: string;
    name: string;
    totalBalance: number;
    tokens: Token[];
    transactions: Transaction[];
  }
  
  export interface AmlScreeningResult {
    address: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    flags: string[];
    timestamp: number;
    walletType?: 'hot' | 'cold';
    provider?: string;
    confidence?: number;
  }
  
  export interface AmlScreeningHistory {
    id: string;
    address: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    flags: string[];
    timestamp: number;
    walletType?: 'hot' | 'cold';
  }
  
  export interface AmlProvider {
    name: string;
    apiKey: string;
    apiSecret?: string;
    baseUrl: string;
    rateLimit: number;
  }
  
  export interface AmlRequest {
    address: string;
    blockchain?: string;
    includeHistory?: boolean;
    riskThreshold?: number;
  }
  
  export interface AmlResponse {
    address: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    flags: string[];
    labels: string[];
    sanctions: boolean;
    pep: boolean;
    timestamp: number;
    provider: string;
    confidence: number;
  }