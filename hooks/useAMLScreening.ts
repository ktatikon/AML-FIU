import { useState, useCallback } from 'react';
import { amlService } from '@/services/amlService';
import { AmlScreeningResult } from '@/types/wallet';

interface UseAMLScreeningReturn {
  screeningResult: AmlScreeningResult | null;
  isLoading: boolean;
  error: string | null;
  screenAddress: (address: string) => Promise<void>;
  clearResult: () => void;
  retry: () => Promise<void>;
}

export const useAMLScreening = (): UseAMLScreeningReturn => {
  const [screeningResult, setScreeningResult] = useState<AmlScreeningResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAddress, setLastAddress] = useState<string>('');

  const screenAddress = useCallback(async (address: string) => {
    if (!address) {
      setError('Address is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastAddress(address);

    try {
      const result = await amlService.screenAddress(address);
      setScreeningResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setScreeningResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(async () => {
    if (lastAddress) {
      await screenAddress(lastAddress);
    }
  }, [lastAddress, screenAddress]);

  const clearResult = useCallback(() => {
    setScreeningResult(null);
    setError(null);
    setLastAddress('');
  }, []);

  return {
    screeningResult,
    isLoading,
    error,
    screenAddress,
    clearResult,
    retry,
  };
};