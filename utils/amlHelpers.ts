import { AmlScreeningResult } from '@/types/wallet';

export const formatRiskLevel = (riskLevel: string): string => {
  return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
};

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return '#34C759';
    case 'medium':
      return '#FF9500';
    case 'high':
    case 'extreme':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
};

export const shouldBlockTransaction = (screeningResult: AmlScreeningResult): boolean => {
  return screeningResult.riskLevel === 'extreme' || screeningResult.riskScore > 90;
};

export const shouldFlagTransaction = (screeningResult: AmlScreeningResult): boolean => {
  return screeningResult.riskLevel === 'high' || screeningResult.riskScore > 60;
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const validateEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const truncateAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

export const calculateRiskPercentage = (riskScore: number): number => {
  return Math.min(Math.max(riskScore, 0), 100);
};

export const getRiskDescription = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return 'This address appears to be safe with minimal risk indicators.';
    case 'medium':
      return 'This address has some risk factors that require attention.';
    case 'high':
      return 'This address has significant risk factors. Proceed with caution.';
    case 'extreme':
      return 'This address is extremely high risk. Transaction should be blocked.';
    default:
      return 'Risk level unknown.';
  }
};

export const getWalletTypeDescription = (walletType: 'hot' | 'cold'): string => {
  switch (walletType) {
    case 'hot':
      return 'Hot wallets are connected to the internet and typically used for frequent transactions. They may include exchange wallets, web wallets, or mobile wallets.';
    case 'cold':
      return 'Cold wallets are offline storage solutions that provide enhanced security. They include hardware wallets, paper wallets, or air-gapped systems.';
    default:
      return 'Wallet type could not be determined.';
  }
};

export const formatConfidenceScore = (confidence: number): string => {
  if (confidence >= 90) return 'Very High';
  if (confidence >= 75) return 'High';
  if (confidence >= 60) return 'Medium';
  if (confidence >= 40) return 'Low';
  return 'Very Low';
};

export const getRecommendedAction = (screeningResult: AmlScreeningResult): {
  action: 'allow' | 'flag' | 'block';
  message: string;
} => {
  if (shouldBlockTransaction(screeningResult)) {
    return {
      action: 'block',
      message: 'Transaction should be blocked due to extremely high risk factors.',
    };
  }
  
  if (shouldFlagTransaction(screeningResult)) {
    return {
      action: 'flag',
      message: 'Transaction should be flagged for manual review due to elevated risk.',
    };
  }
  
  return {
    action: 'allow',
    message: 'Transaction can proceed with standard monitoring.',
  };
};

export const categorizeRiskFlags = (flags: string[]): {
  sanctions: string[];
  criminal: string[];
  exchange: string[];
  mixer: string[];
  other: string[];
} => {
  const categories = {
    sanctions: [] as string[],
    criminal: [] as string[],
    exchange: [] as string[],
    mixer: [] as string[],
    other: [] as string[],
  };
  
  flags.forEach(flag => {
    const lowerFlag = flag.toLowerCase();
    
    if (lowerFlag.includes('sanction') || lowerFlag.includes('ofac')) {
      categories.sanctions.push(flag);
    } else if (lowerFlag.includes('criminal') || lowerFlag.includes('illicit') || lowerFlag.includes('fraud')) {
      categories.criminal.push(flag);
    } else if (lowerFlag.includes('exchange') || lowerFlag.includes('cex')) {
      categories.exchange.push(flag);
    } else if (lowerFlag.includes('mixer') || lowerFlag.includes('tumbler')) {
      categories.mixer.push(flag);
    } else {
      categories.other.push(flag);
    }
  });
  
  return categories;
};

export const generateAMLReport = (screeningResult: AmlScreeningResult): string => {
  const timestamp = formatTimestamp(screeningResult.timestamp);
  const recommendation = getRecommendedAction(screeningResult);
  const flagCategories = categorizeRiskFlags(screeningResult.flags);
  
  let report = `AML Screening Report
`;
  report += `===================

`;
  report += `Address: ${screeningResult.address}
`;
  report += `Screening Date: ${timestamp}
`;
  report += `Risk Score: ${screeningResult.riskScore}/100
`;
  report += `Risk Level: ${formatRiskLevel(screeningResult.riskLevel)}
`;
  
  if (screeningResult.walletType) {
    report += `Wallet Type: ${formatRiskLevel(screeningResult.walletType)} Wallet
`;
  }
  
  if (screeningResult.confidence) {
    report += `Confidence: ${screeningResult.confidence}% (${formatConfidenceScore(screeningResult.confidence)})
`;
  }
  
  report += `
Recommended Action: ${recommendation.action.toUpperCase()}
`;
  report += `Reason: ${recommendation.message}
`;
  
  if (screeningResult.flags.length > 0) {
    report += `
Risk Factors (${screeningResult.flags.length}):
`;
    
    if (flagCategories.sanctions.length > 0) {
      report += `
Sanctions:
`;
      flagCategories.sanctions.forEach(flag => report += `- ${flag}
`);
    }
    
    if (flagCategories.criminal.length > 0) {
      report += `
Criminal Activity:
`;
      flagCategories.criminal.forEach(flag => report += `- ${flag}
`);
    }
    
    if (flagCategories.exchange.length > 0) {
      report += `
Exchange Related:
`;
      flagCategories.exchange.forEach(flag => report += `- ${flag}
`);
    }
    
    if (flagCategories.mixer.length > 0) {
      report += `
Mixer/Tumbler:
`;
      flagCategories.mixer.forEach(flag => report += `- ${flag}
`);
    }
    
    if (flagCategories.other.length > 0) {
      report += `
Other Factors:
`;
      flagCategories.other.forEach(flag => report += `- ${flag}
`);
    }
  }
  
  report += `
---
`;
  report += `Generated by AML Checker v1.0
`;
  
  return report;
};