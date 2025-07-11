import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/hooks/useWalletStore';
import AmlRiskIndicator from '@/components/AmlRiskIndicator';
import { amlService } from '@/services/amlService';
import { AmlScreeningResult } from '@/types/wallet';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { wallet } = useWalletStore();
  const [screeningResult, setScreeningResult] = React.useState<AmlScreeningResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const transaction = wallet.transactions.find(t => t.id === id);
  
  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'send':
        return <ArrowUpRight size={24} color={Colors.dark.primary} />;
      case 'receive':
        return <ArrowDownLeft size={24} color={Colors.dark.secondary} />;
      case 'swap':
        return <RefreshCw size={24} color={Colors.dark.warning} />;
      default:
        return null;
    }
  };
  
  const getTransactionTitle = () => {
    switch (transaction.type) {
      case 'send':
        return 'Sent';
      case 'receive':
        return 'Received';
      case 'swap':
        return 'Swapped';
      default:
        return '';
    }
  };
  
  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(transaction.address);
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleViewOnExplorer = () => {
    // In a real app, this would open the transaction in a blockchain explorer
    Linking.openURL(`https://etherscan.io/address/${transaction.address}`);
  };
  
  const handleScreenAddress = async () => {
    setIsLoading(true);
    try {
      const result = await amlService.screenAddress(transaction.address);
      setScreeningResult(result);
    } catch (error) {
      console.error('Error screening address:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getTransactionIcon()}
        </View>
        <Text style={styles.title}>{getTransactionTitle()}</Text>
        <Text style={styles.amount}>
          {transaction.type === 'receive' ? '+' : transaction.type === 'send' ? '-' : ''}
          {transaction.amount} {transaction.token}
        </Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: transaction.status === 'completed' 
                ? 'rgba(52, 199, 89, 0.1)' 
                : transaction.status === 'pending'
                ? 'rgba(255, 149, 0, 0.1)'
                : 'rgba(255, 59, 48, 0.1)' 
            }
          ]}>
            <Text style={[
              styles.statusText,
              { 
                color: transaction.status === 'completed' 
                  ? Colors.dark.success 
                  : transaction.status === 'pending'
                  ? Colors.dark.warning
                  : Colors.dark.danger 
              }
            ]}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(transaction.timestamp)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
              {transaction.address}
            </Text>
            <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
              <Copy size={16} color={Colors.dark.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {transaction.amlStatus && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>AML Status</Text>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: transaction.amlStatus === 'approved' 
                  ? 'rgba(52, 199, 89, 0.1)' 
                  : transaction.amlStatus === 'flagged'
                  ? 'rgba(255, 149, 0, 0.1)'
                  : 'rgba(255, 59, 48, 0.1)' 
              }
            ]}>
              <Text style={[
                styles.statusText,
                { 
                  color: transaction.amlStatus === 'approved' 
                    ? Colors.dark.success 
                    : transaction.amlStatus === 'flagged'
                    ? Colors.dark.warning
                    : Colors.dark.danger 
                }
              ]}>
                {transaction.amlStatus.charAt(0).toUpperCase() + transaction.amlStatus.slice(1)}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.explorerButton} onPress={handleViewOnExplorer}>
        <Text style={styles.explorerButtonText}>View on Explorer</Text>
        <ExternalLink size={16} color={Colors.dark.primary} />
      </TouchableOpacity>
      
      {!screeningResult && transaction.type === 'send' && (
        <TouchableOpacity 
          style={styles.screenButton} 
          onPress={handleScreenAddress}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.screenButtonText}>Screening...</Text>
          ) : (
            <Text style={styles.screenButtonText}>Screen Address for AML Risk</Text>
          )}
        </TouchableOpacity>
      )}
      
      {screeningResult && (
        <View style={styles.screeningContainer}>
          <Text style={styles.screeningTitle}>AML Screening Result</Text>
          <AmlRiskIndicator screeningResult={screeningResult} />
        </View>
      )}
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(177, 66, 10, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
    fontFamily: 'Poppins',
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontFamily: 'Poppins',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    maxWidth: '60%',
    fontFamily: 'Poppins',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(177, 66, 10, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  explorerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.primary,
    marginRight: 8,
    fontFamily: 'Poppins',
  },
  screenButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  screenButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.primary,
    fontFamily: 'Poppins',
  },
  screeningContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  screeningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark.danger,
    textAlign: 'center',
    marginTop: 24,
    fontFamily: 'Poppins',
  },
});