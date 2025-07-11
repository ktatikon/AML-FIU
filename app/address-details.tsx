import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Shield, Copy, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { amlService } from '@/services/amlService';
import { AmlScreeningResult } from '@/types/wallet';
import AmlRiskIndicator from '@/components/AmlRiskIndicator';
import Button from '@/components/Button';
import ErrorBoundary from '@/components/ErrorBoundary';

const AddressDetailsScreen = React.memo(() => {
  const { address } = useLocalSearchParams<{ address: string }>();
  const router = useRouter();
  const [screeningResult, setScreeningResult] = useState<AmlScreeningResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      loadAddressDetails();
    }
  }, [address]);

  const loadAddressDetails = async () => {
    if (!address) return;

    // First try to get from cache
    const cached = amlService.getCachedResult(address);
    if (cached) {
      setScreeningResult(cached);
      return;
    }

    // If not in cache, screen the address
    setIsLoading(true);
    setError(null);

    try {
      const result = await amlService.screenAddress(address);
      setScreeningResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load address details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      await Clipboard.setStringAsync(address);
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Copied', 'Address copied to clipboard');
    } catch (error) {
      Alert.alert('Copy Failed', 'Unable to copy address to clipboard');
    }
  };

  const handleRefresh = async () => {
    if (!address) return;
    
    // Clear cache for this address and reload
    amlService.deleteCachedResult(address);
    await loadAddressDetails();
  };

  const handleViewOnExplorer = () => {
    if (!address) return;
    
    Alert.alert(
      'View on Explorer',
      `Would open ${address} on Etherscan`,
      [{ text: 'OK' }]
    );
  };

  if (!address) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No address provided</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={32} color={Colors.dark.primary} />
          </View>
          <Text style={styles.title}>Address Details</Text>
          <Text style={styles.address} numberOfLines={2} ellipsizeMode="middle">
            {address}
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCopyAddress}>
              <Copy size={20} color={Colors.dark.primary} />
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleViewOnExplorer}>
              <ExternalLink size={20} color={Colors.dark.primary} />
              <Text style={styles.actionButtonText}>Explorer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
              <RefreshCw size={20} color={Colors.dark.primary} />
              <Text style={styles.actionButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading address details...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <AlertTriangle size={20} color={Colors.dark.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              onPress={loadAddressDetails}
              variant="outline"
              size="small"
            />
          </View>
        )}

        {screeningResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AML Screening Result</Text>
            <AmlRiskIndicator screeningResult={screeningResult} />
            
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Screening Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Provider</Text>
                <Text style={styles.detailValue}>{screeningResult.provider || 'Mock Provider'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confidence</Text>
                <Text style={styles.detailValue}>{screeningResult.confidence || 85}%</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>
                  {new Date(screeningResult.timestamp).toLocaleString()}
                </Text>
              </View>
              
              {screeningResult.walletType && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Wallet Type</Text>
                  <Text style={styles.detailValue}>
                    {screeningResult.walletType.charAt(0).toUpperCase() + screeningResult.walletType.slice(1)} Wallet
                  </Text>
                </View>
              )}
            </View>

            {screeningResult.flags.length > 0 && (
              <View style={styles.flagsCard}>
                <Text style={styles.flagsTitle}>Risk Factors ({screeningResult.flags.length})</Text>
                {screeningResult.flags.map((flag, index) => (
                  <View key={index} style={styles.flagItem}>
                    <View style={styles.flagDot} />
                    <Text style={styles.flagText}>{flag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomActions}>
          <Button
            title="Screen Another Address"
            onPress={() => router.back()}
            variant="primary"
            fullWidth
          />
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
});

AddressDetailsScreen.displayName = 'AddressDetailsScreen';

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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.primary,
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  flagsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
  },
  flagsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.danger,
    marginRight: 12,
  },
  flagText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  bottomActions: {
    marginTop: 24,
  },
});

export default AddressDetailsScreen;
