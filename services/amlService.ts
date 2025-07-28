import { AmlScreeningResult } from '@/types/wallet';

// Enhanced AML service with wallet type detection and Redis-like caching
class AMLService {
  private static instance: AMLService;
  private cache = new Map<string, { result: AmlScreeningResult; timestamp: number }>();
  private readonly CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
  private readonly API_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 3;

  private constructor() {}

  static getInstance(): AMLService {
    if (!AMLService.instance) {
      AMLService.instance = new AMLService();
    }
    return AMLService.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private determineWalletType(address: string): 'hot' | 'cold' {
    // Known exchange addresses (hot wallets)
    const EXCHANGE_ADDRESSES = [
      '0x8C8D7C46219D9205f056f28fee5950aD564d7465',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    ];

    // Known cold storage patterns or addresses
    const COLD_STORAGE_ADDRESSES = [
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    ];

    if (EXCHANGE_ADDRESSES.includes(address)) {
      return 'hot';
    }

    if (COLD_STORAGE_ADDRESSES.includes(address)) {
      return 'cold';
    }

    // Simple heuristic: addresses with low activity might be cold storage
    // In real implementation, this would check transaction frequency
    const addressHash = parseInt(address.slice(-4), 16);
    return addressHash % 3 === 0 ? 'cold' : 'hot';
  }

  private mockScreening(address: string): AmlScreeningResult {
    const HIGH_RISK_ADDRESSES = [
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    ];

    const MEDIUM_RISK_ADDRESSES = [
      '0x8C8D7C46219D9205f056f28fee5950aD564d7465',
    ];

    let riskScore = 0;
    let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    const flags: string[] = [];
    const walletType = this.determineWalletType(address);

    if (HIGH_RISK_ADDRESSES.includes(address)) {
      riskScore = Math.floor(Math.random() * 30) + 70;
      riskLevel = riskScore > 90 ? 'extreme' : 'high';
      flags.push('Sanctioned entity', 'Suspicious activity');
      
      if (riskScore > 90) {
        flags.push('OFAC restricted');
      }
      
      if (walletType === 'hot') {
        flags.push('Exchange wallet');
      }
    } else if (MEDIUM_RISK_ADDRESSES.includes(address)) {
      riskScore = Math.floor(Math.random() * 30) + 40;
      riskLevel = 'medium';
      flags.push('Unverified exchange');
      
      if (walletType === 'hot') {
        flags.push('Hot wallet detected');
      }
    } else {
      riskScore = Math.floor(Math.random() * 40);
      riskLevel = 'low';
      
      if (riskScore > 20) {
        flags.push('New address');
      }
      
      if (walletType === 'cold') {
        flags.push('Cold storage wallet');
      }
    }

    return {
      address,
      riskScore,
      riskLevel,
      flags,
      timestamp: Date.now(),
      walletType,
      provider: 'Mock AML Provider',
      confidence: Math.floor(Math.random() * 20) + 80,
    };
  }

  async screenAddress(address: string): Promise<AmlScreeningResult> {
    try {
      // Check cache first
      const cached = this.cache.get(address);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.result;
      }

      // Simulate API delay
      await this.delay(1000 + Math.random() * 2000);

      // For demo purposes, use mock screening
      const result = this.mockScreening(address);
      
      // Cache the result
      this.cache.set(address, { result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error('AML screening failed:', error);
      throw new Error('Failed to screen address. Please try again.');
    }
  }

  // Redis-like cache operations
  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCachedResult(address: string): AmlScreeningResult | null {
    const cached = this.cache.get(address);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    return null;
  }

  setCachedResult(address: string, result: AmlScreeningResult): void {
    this.cache.set(address, { result, timestamp: Date.now() });
  }

  deleteCachedResult(address: string): boolean {
    return this.cache.delete(address);
  }

  getAllCachedAddresses(): string[] {
    return Array.from(this.cache.keys());
  }

  // Cleanup expired cache entries
  cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [address, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.cache.delete(address);
      }
    }
  }
}

export const amlService = AMLService.getInstance();
export { AMLService };