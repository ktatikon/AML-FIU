export interface AMLProvider {
    name: string;
    apiKey: string;
    apiSecret?: string;
    baseUrl: string;
    rateLimit: number; // requests per minute
  }
  
  export interface AMLRequest {
    address: string;
    blockchain?: string;
    includeHistory?: boolean;
    riskThreshold?: number;
  }
  
  export interface AMLResponse {
    address: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    flags: string[];
    labels: string[];
    sanctions: boolean;
    pep: boolean; // Politically Exposed Person
    timestamp: number;
    provider: string;
    confidence: number;
  }
  
  export interface AMLCache {
    key: string;
    data: AMLResponse;
    timestamp: number;
    ttl: number;
  }
  
  export interface AMLError {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
  }
  
  export interface AMLMetrics {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    averageResponseTime: number;
  }