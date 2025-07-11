import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Search, AlertTriangle, CheckCircle, Clock, Database, Zap, History } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAMLScreening } from '@/hooks/useAMLScreening';
import AddressInput from '@/components/AddressInput';
import AmlRiskIndicator from '@/components/AmlRiskIndicator';
import Button from '@/components/Button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { amlService } from '@/services/amlService';

const AMLCheckerScreen = React.memo(() => {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    screeningResult,
    isLoading,
    error,
    screenAddress,
    clearResult,
    retry,
  } = useAMLScreening();

  const validateAddress = useCallback((address: string): boolean => {
    if (!address) {
      setAddressError('Address is required');
      return false;
    }
    
    if (!address.startsWith('0x') || address.length !== 42) {
      setAddressError('Invalid Ethereum address format');
      return false;
    }
    
    setAddressError('');
    return true;
  }, []);

  const handleAddressChange = useCallback((text: string) => {
    setAddress(text);
    if (addressError) {
      validateAddress(text);
    }
    if (screeningResult && screeningResult.address !== text) {
      clearResult();
    }
  }, [addressError, screeningResult, validateAddress, clearResult]);

  const handleScreenAddress = useCallback(async () => {
    if (!validateAddress(address)) return;
    await screenAddress(address);
  }, [address, validateAddress, screenAddress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    amlService.clearCache();
    if (screeningResult) {
      await retry();
    }
    setRefreshing(false);
  }, [screeningResult, retry]);

  const getRiskStatusIcon = () => {
    if (!screeningResult) return null;
    
    switch (screeningResult.riskLevel) {
      case 'low':
        return <CheckCircle size={24} color={Colors.dark.success} />;
      case 'medium':
        return <Clock size={24} color={Colors.dark.warning} />;
      case 'high':
      case 'extreme':
        return <AlertTriangle size={24} color={Colors.dark.danger} />;
      default:
        return null;
    }
  };

  const getQuickActions = () => {
    const testAddresses = [
      { 
        label: 'Test Low Risk Address', 
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        type: 'Cold Wallet'
      },
      { 
        label: 'Test Medium Risk Address', 
        address: '0x8C8D7C46219D9205f056f28fee5950aD564d7465',
        type: 'Hot Wallet'
      },
      { 
        label: 'Test High Risk Address', 
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        type: 'Exchange Wallet'
      },
    ];

    return (
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Test Addresses</Text>
        {testAddresses.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionButton}
            onPress={() => setAddress(item.address)}
          >
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionText}>{item.label}</Text>
              <Text style={styles.quickActionType}>{item.type}</Text>
            </View>
            <Zap size={16} color={Colors.dark.primary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={Colors.dark.primary}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Shield size={40} color={Colors.dark.primary} />
            </View>
            <Text style={styles.title}>AML Checker</Text>
            <Text style={styles.subtitle}>
              Screen wallet addresses for compliance and risk assessment.
              Detect wallet types and transaction patterns.
            </Text>
            
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => router.push('/screening-history')}
            >
              <History size={20} color={Colors.dark.primary} />
              <Text style={styles.historyButtonText}>View History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <AddressInput
              value={address}
              onChangeText={handleAddressChange}
              placeholder="Enter wallet address to screen"
              error={addressError}
            />

            <Button
              title={isLoading ? "Screening Address..." : "Check Address"}
              onPress={handleScreenAddress}
              icon={<Search size={20} color={Colors.dark.text} />}
              disabled={!address || !!addressError || isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={20} color={Colors.dark.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={retry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {screeningResult && (
            <View style={styles.section}>
              <View style={styles.resultHeader}>
                {getRiskStatusIcon()}
                <Text style={styles.resultTitle}>Screening Result</Text>
              </View>
              <AmlRiskIndicator screeningResult={screeningResult} />
              
              <View style={styles.resultMetadata}>
                <Text style={styles.metadataText}>
                  Screened: {new Date(screeningResult.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.metadataText}>
                  Address: {screeningResult.address.substring(0, 10)}...{screeningResult.address.substring(screeningResult.address.length - 8)}
                </Text>
                {screeningResult.walletType && (
                  <Text style={styles.metadataText}>
                    Type: {screeningResult.walletType.charAt(0).toUpperCase() + screeningResult.walletType.slice(1)} Wallet
                  </Text>
                )}
              </View>
              
              <Button
                title="View Full Details"
                onPress={() => router.push({
                  pathname: '/address-details',
                  params: { address: screeningResult.address }
                })}
                variant="outline"
                fullWidth
              />
            </View>
          )}

          {getQuickActions()}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Database size={20} color={Colors.dark.primary} />
              <Text style={styles.statLabel}>Cached Results</Text>
              <Text style={styles.statValue}>{amlService.getCacheSize()}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
});

AMLCheckerScreen.displayName = 'AMLCheckerScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.primary,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.danger,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.danger,
    marginLeft: 12,
  },
  retryButton: {
    backgroundColor: Colors.dark.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 12,
  },
  resultMetadata: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
  },
  metadataText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  quickActions: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  quickActionType: {
    fontSize: 14,
    color: Colors.dark.primary,
  },
  statsContainer: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginLeft: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
});

export default AMLCheckerScreen;