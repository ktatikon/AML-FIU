import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/hooks/useWalletStore';
import Button from '@/components/Button';
import AddressInput from '@/components/AddressInput';
import AmlRiskIndicator from '@/components/AmlRiskIndicator';

export default function SendScreen() {
  const router = useRouter();
  const { wallet, screenTransaction, currentScreening, screeningStatus, clearCurrentScreening, addTransaction } = useWalletStore();
  
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(wallet.tokens[0]);
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Clear screening result when component unmounts
  useEffect(() => {
    return () => {
      clearCurrentScreening();
    };
  }, [clearCurrentScreening]);
  
  const validateAddress = (address: string) => {
    if (!address) {
      setAddressError('Address is required');
      return false;
    }
    
    // Simple validation for Ethereum address
    // In a real app, you would use a proper validation library
    if (!address.startsWith('0x') || address.length !== 42) {
      setAddressError('Invalid Ethereum address');
      return false;
    }
    
    setAddressError('');
    return true;
  };
  
  const validateAmount = (amount: string) => {
    if (!amount) {
      setAmountError('Amount is required');
      return false;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }
    
    const token = wallet.tokens.find(t => t.id === selectedToken.id);
    if (token && parseFloat(amount) > parseFloat(token.balance)) {
      setAmountError('Insufficient balance');
      return false;
    }
    
    setAmountError('');
    return true;
  };
  
  const handleAddressChange = (text: string) => {
    setAddress(text);
    if (addressError) validateAddress(text);
    
    // Clear previous screening result when address changes
    if (currentScreening && currentScreening.address !== text) {
      clearCurrentScreening();
    }
  };
  
  const handleAmountChange = (text: string) => {
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setAmount(text);
      if (amountError) validateAmount(text);
    }
  };
  
  const handleScreenAddress = async () => {
    if (!validateAddress(address)) return;
    
    try {
      await screenTransaction(address);
    } catch (error) {
      console.error('Error screening address:', error);
    }
  };
  
  const handleSubmit = async () => {
    const isAddressValid = validateAddress(address);
    const isAmountValid = validateAmount(amount);
    
    if (!isAddressValid || !isAmountValid) return;
    
    // If we haven't screened the address yet, do it now
    if (!currentScreening || currentScreening.address !== address) {
      await handleScreenAddress();
      return;
    }
    
    // If the risk is too high, don't allow the transaction
    if (currentScreening.riskLevel === 'extreme') {
      alert('Transaction blocked due to high risk. Please contact support.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addTransaction({
        type: 'send',
        amount,
        token: selectedToken.symbol,
        address,
      });
      
      // Navigate back after successful transaction
      router.back();
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Failed to send transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canProceed = address && amount && !addressError && !amountError;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <AddressInput
          value={address}
          onChangeText={handleAddressChange}
          error={addressError}
        />
        
        <View style={styles.amountContainer}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={Colors.dark.textSecondary}
              keyboardType="decimal-pad"
            />
            
            <TouchableOpacity style={styles.tokenSelector}>
              <Text style={styles.tokenText}>{selectedToken.symbol}</Text>
              <ArrowRight size={16} color={Colors.dark.primary} />
            </TouchableOpacity>
          </View>
          {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
          
          <Text style={styles.balanceText}>
            Balance: {selectedToken.balance} {selectedToken.symbol}
          </Text>
        </View>
      </View>
      
      {screeningStatus === 'loading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Screening address...</Text>
        </View>
      )}
      
      {currentScreening && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AML Screening Result</Text>
          <AmlRiskIndicator screeningResult={currentScreening} />
          
          {currentScreening.riskLevel === 'extreme' && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                This address has been identified as high risk. Transaction is blocked.
              </Text>
            </View>
          )}
          
          {currentScreening.riskLevel === 'high' && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                This address has been flagged as potentially risky. Proceed with caution.
              </Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        {!currentScreening && canProceed ? (
          <Button
            title="Screen Address"
            onPress={handleScreenAddress}
            fullWidth
            loading={screeningStatus === 'loading'}
          />
        ) : (
          <Button
            title="Send"
            onPress={handleSubmit}
            fullWidth
            disabled={!canProceed || currentScreening?.riskLevel === 'extreme' || isSubmitting}
            loading={isSubmitting}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  amountContainer: {
    marginTop: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 12,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.dark.text,
    fontFamily: 'Poppins',
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(177, 66, 10, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tokenText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginRight: 4,
    fontFamily: 'Poppins',
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark.danger,
    marginTop: 4,
    fontFamily: 'Poppins',
  },
  balanceText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 8,
    fontFamily: 'Poppins',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 12,
    fontFamily: 'Poppins',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    color: Colors.dark.danger,
    fontFamily: 'Poppins',
  },
  buttonContainer: {
    marginTop: 24,
  },
});