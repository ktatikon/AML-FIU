import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Clock, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { amlService } from '@/services/amlService';
import { AmlScreeningResult } from '@/types/wallet';
import ErrorBoundary from '@/components/ErrorBoundary';

const ScreeningHistoryScreen = React.memo(() => {
  const router = useRouter();
  const [history, setHistory] = useState<AmlScreeningResult[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const addresses = amlService.getAllCachedAddresses();
    const results = addresses
      .map(address => amlService.getCachedResult(address))
      .filter((result): result is AmlScreeningResult => result !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    setHistory(results);
  };

  const handleClearHistory = () => {
    amlService.clearCache();
    setHistory([]);
  };

  const handleItemPress = (address: string) => {
    router.push({
      pathname: '/address-details',
      params: { address }
    });
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle size={20} color={Colors.dark.success} />;
      case 'medium':
        return <Clock size={20} color={Colors.dark.warning} />;
      case 'high':
      case 'extreme':
        return <AlertTriangle size={20} color={Colors.dark.danger} />;
      default:
        return null;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return Colors.dark.success;
      case 'medium':
        return Colors.dark.warning;
      case 'high':
      case 'extreme':
        return Colors.dark.danger;
      default:
        return Colors.dark.textSecondary;
    }
  };

  const renderHistoryItem = ({ item }: { item: AmlScreeningResult }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleItemPress(item.address)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.riskInfo}>
          {getRiskIcon(item.riskLevel)}
          <Text style={[styles.riskLevel, { color: getRiskColor(item.riskLevel) }]}>
            {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)} Risk
          </Text>
        </View>
        <Text style={styles.riskScore}>{item.riskScore}/100</Text>
      </View>
      
      <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
        {item.address}
      </Text>
      
      <View style={styles.itemFooter}>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        {item.walletType && (
          <View style={styles.walletTypeBadge}>
            <Text style={styles.walletTypeText}>
              {item.walletType.charAt(0).toUpperCase() + item.walletType.slice(1)} Wallet
            </Text>
          </View>
        )}
      </View>
      
      {item.flags.length > 0 && (
        <View style={styles.flagsContainer}>
          <Text style={styles.flagsText}>
            {item.flags.slice(0, 2).join(', ')}
            {item.flags.length > 2 && ` +${item.flags.length - 2} more`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Shield size={24} color={Colors.dark.primary} />
            <Text style={styles.headerTitle}>Screening History</Text>
          </View>
          
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearHistory}
            >
              <Trash2 size={20} color={Colors.dark.danger} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={history}
          keyExtractor={(item) => item.address}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Shield size={48} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyTitle}>No Screening History</Text>
              <Text style={styles.emptyText}>
                Start screening wallet addresses to see your history here.
              </Text>
            </View>
          }
        />
      </View>
    </ErrorBoundary>
  );
});

ScreeningHistoryScreen.displayName = 'ScreeningHistoryScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.danger,
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  riskScore: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  address: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  walletTypeBadge: {
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  walletTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.primary,
  },
  flagsContainer: {
    marginTop: 4,
  },
  flagsText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ScreeningHistoryScreen;