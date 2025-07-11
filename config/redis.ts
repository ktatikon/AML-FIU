// Redis configuration for caching AML results
// This would be used in a backend implementation

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    ttl: number; // Time to live in seconds
  }
  
  export const redisConfig: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'aml:',
    ttl: 6 * 60 * 60, // 6 hours
  };
  
  // Redis client setup (for backend use)
  export class RedisCache {
    private client: any; // Would be Redis client instance
    private config: RedisConfig;
  
    constructor(config: RedisConfig) {
      this.config = config;
      // Initialize Redis client here
      // this.client = new Redis(config);
    }
  
    async get(key: string): Promise<string | null> {
      try {
        const fullKey = `${this.config.keyPrefix}${key}`;
        return await this.client.get(fullKey);
      } catch (error) {
        console.error('Redis GET error:', error);
        return null;
      }
    }
  
    async set(key: string, value: string, ttl?: number): Promise<boolean> {
      try {
        const fullKey = `${this.config.keyPrefix}${key}`;
        const expiry = ttl || this.config.ttl;
        await this.client.setex(fullKey, expiry, value);
        return true;
      } catch (error) {
        console.error('Redis SET error:', error);
        return false;
      }
    }
  
    async del(key: string): Promise<boolean> {
      try {
        const fullKey = `${this.config.keyPrefix}${key}`;
        await this.client.del(fullKey);
        return true;
      } catch (error) {
        console.error('Redis DEL error:', error);
        return false;
      }
    }
  
    async exists(key: string): Promise<boolean> {
      try {
        const fullKey = `${this.config.keyPrefix}${key}`;
        const result = await this.client.exists(fullKey);
        return result === 1;
      } catch (error) {
        console.error('Redis EXISTS error:', error);
        return false;
      }
    }
  
    async flushAll(): Promise<boolean> {
      try {
        await this.client.flushall();
        return true;
      } catch (error) {
        console.error('Redis FLUSHALL error:', error);
        return false;
      }
    }
  
    // Pattern-based operations
    async keys(pattern: string): Promise<string[]> {
      try {
        return await this.client.keys(`${this.config.keyPrefix}${pattern}`);
      } catch (error) {
        console.error('Redis KEYS error:', error);
        return [];
      }
    }
  
    async mget(keys: string[]): Promise<(string | null)[]> {
      try {
        const fullKeys = keys.map(key => `${this.config.keyPrefix}${key}`);
        return await this.client.mget(fullKeys);
      } catch (error) {
        console.error('Redis MGET error:', error);
        return [];
      }
    }
  
    async mset(keyValuePairs: Record<string, string>, ttl?: number): Promise<boolean> {
      try {
        const pipeline = this.client.pipeline();
        const expiry = ttl || this.config.ttl;
        
        for (const [key, value] of Object.entries(keyValuePairs)) {
          const fullKey = `${this.config.keyPrefix}${key}`;
          pipeline.setex(fullKey, expiry, value);
        }
        
        await pipeline.exec();
        return true;
      } catch (error) {
        console.error('Redis MSET error:', error);
        return false;
      }
    }
  
    // Health check
    async ping(): Promise<boolean> {
      try {
        const result = await this.client.ping();
        return result === 'PONG';
      } catch (error) {
        console.error('Redis PING error:', error);
        return false;
      }
    }
  
    // Get cache statistics
    async getStats(): Promise<{
      totalKeys: number;
      memoryUsage: string;
      hitRate: number;
    }> {
      try {
        const info = await this.client.info('memory');
        const keyCount = await this.client.dbsize();
        
        return {
          totalKeys: keyCount,
          memoryUsage: this.parseMemoryUsage(info),
          hitRate: 0, // Would need to track this separately
        };
      } catch (error) {
        console.error('Redis STATS error:', error);
        return {
          totalKeys: 0,
          memoryUsage: '0B',
          hitRate: 0,
        };
      }
    }
  
    private parseMemoryUsage(info: string): string {
      const match = info.match(/used_memory_human:(.+)/);
      return match ? match[1].trim() : '0B';
    }
  
    // Cleanup expired keys
    async cleanup(): Promise<number> {
      try {
        const keys = await this.keys('*');
        let deletedCount = 0;
        
        for (const key of keys) {
          const ttl = await this.client.ttl(key);
          if (ttl === -1) { // Key exists but has no expiry
            await this.client.expire(key, this.config.ttl);
          } else if (ttl === -2) { // Key doesn't exist
            deletedCount++;
          }
        }
        
        return deletedCount;
      } catch (error) {
        console.error('Redis CLEANUP error:', error);
        return 0;
      }
    }
  }
  
  // Singleton instance for the app
  let redisInstance: RedisCache | null = null;
  
  export const getRedisInstance = (): RedisCache => {
    if (!redisInstance) {
      redisInstance = new RedisCache(redisConfig);
    }
    return redisInstance;
  };
  
  // Environment-specific configurations
  export const getRedisConfigForEnv = (env: 'development' | 'staging' | 'production'): RedisConfig => {
    const baseConfig = { ...redisConfig };
    
    switch (env) {
      case 'development':
        return {
          ...baseConfig,
          db: 0,
          keyPrefix: 'dev:aml:',
          ttl: 1 * 60 * 60, // 1 hour for dev
        };
      case 'staging':
        return {
          ...baseConfig,
          db: 1,
          keyPrefix: 'staging:aml:',
          ttl: 3 * 60 * 60, // 3 hours for staging
        };
      case 'production':
        return {
          ...baseConfig,
          db: 2,
          keyPrefix: 'prod:aml:',
          ttl: 6 * 60 * 60, // 6 hours for production
        };
      default:
        return baseConfig;
    }
  };