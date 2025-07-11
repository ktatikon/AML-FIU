import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockWallet } from '@/mocks/walletData';
import { AmlScreeningResult, AmlStatus, Transaction, Wallet } from '@/types/wallet';
import { amlService } from '@/services/amlService';

interface WalletState {
  wallet: Wallet;
  isLoading: boolean;
  currentScreening: AmlScreeningResult | null;
  screeningStatus: 'idle' | 'loading' | 'success' | 'error';
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'status' | 'amlStatus'>) => Promise<Transaction>;
  screenTransaction: (address: string) => Promise<AmlScreeningResult>;
  clearCurrentScreening: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: mockWallet,
      isLoading: false,
      currentScreening: null,
      screeningStatus: 'idle',
      
      addTransaction: async (transactionData) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newTransaction: Transaction = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            status: 'completed',
            ...transactionData,
          };
          
          if (newTransaction.type === 'send') {
            try {
              const screeningResult = await amlService.screenAddress(newTransaction.address);
              
              let amlStatus: AmlStatus = 'approved';
              if (screeningResult.riskScore > 90) {
                amlStatus = 'blocked';
                newTransaction.status = 'failed';
              } else if (screeningResult.riskScore > 60) {
                amlStatus = 'flagged';
              }
              
              newTransaction.amlStatus = amlStatus;
            } catch (error) {
              console.error('AML screening failed:', error);
            }
          }
          
          set(state => ({
            isLoading: false,
            wallet: {
              ...state.wallet,
              transactions: [newTransaction, ...state.wallet.transactions],
            },
          }));
          
          return newTransaction;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      screenTransaction: async (address: string) => {
        set({ screeningStatus: 'loading' });
        
        try {
          const result = await amlService.screenAddress(address);
          set({ currentScreening: result, screeningStatus: 'success' });
          return result;
        } catch (error) {
          set({ screeningStatus: 'error' });
          throw error;
        }
      },
      
      clearCurrentScreening: () => {
        set({ currentScreening: null, screeningStatus: 'idle' });
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        wallet: state.wallet,
      }),
    }
  )
);