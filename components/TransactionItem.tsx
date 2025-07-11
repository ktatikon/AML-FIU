import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, AlertTriangle, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Transaction } from '@/types/wallet';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'send':
        return <ArrowUpRight size={20} color={Colors.dark.primary} />;
      case 'receive':
        return <ArrowDownLeft size={20} color={Colors.dark.secondary} />;
      case 'swap':
        return <RefreshCw size={20} color={Colors.dark.warning} />;
      default:
        return null;
    }
  };
  
  const getAmlStatusIcon = () => {
    if (!transaction.amlStatus) return null;
    
    switch (transaction.amlStatus) {
      case 'approved':
        return <ShieldCheck size={16} color={Colors.dark.success} />;
      case 'flagged':
        return <ShieldAlert size={16} color={Colors.dark.warning} />;
      case 'blocked':
        return <ShieldX size={16} color={Colors.dark.danger} />;
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
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getStatusColor = () => {
    if (transaction.status === 'failed') return Colors.dark.danger;
    if (transaction.amlStatus === 'blocked') return Colors.dark.danger;
    if (transaction.amlStatus === 'flagged') return Colors.dark.warning;
    return Colors.dark.success;
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getTransactionIcon()}
      </View>
      
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{getTransactionTitle()}</Text>
          <Text style={styles.amount}>
            {transaction.type === 'receive' ? '+' : transaction.type === 'send' ? '-' : ''}
            {transaction.amount} {transaction.token}
          </Text>
        </View>
        
        <View style={styles.bottomRow}>
          <View style={styles.statusContainer}>
            <Text style={styles.date}>{formatDate(transaction.timestamp)}</Text>
            {transaction.status === 'failed' && (
              <View style={styles.statusBadge}>
                <AlertTriangle size={12} color={Colors.dark.danger} />
                <Text style={[styles.statusText, { color: Colors.dark.danger }]}>Failed</Text>
              </View>
            )}
            {transaction.amlStatus && (
              <View style={styles.amlStatus}>
                {getAmlStatusIcon()}
              </View>
            )}
          </View>
          
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {transaction.status === 'pending' ? 'Pending' : 
             transaction.status === 'failed' ? 'Failed' : 
             transaction.amlStatus === 'blocked' ? 'Blocked' :
             transaction.amlStatus === 'flagged' ? 'Flagged' : 'Completed'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(177, 66, 10, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    fontFamily: 'Poppins',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    fontFamily: 'Poppins',
  },
  date: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontFamily: 'Poppins',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  amlStatus: {
    marginLeft: 8,
  },
});