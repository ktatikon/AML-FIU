import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck, ShieldAlert, ShieldX, Thermometer, Snowflake } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { AmlScreeningResult } from '@/types/wallet';

interface AmlRiskIndicatorProps {
  screeningResult: AmlScreeningResult;
}

const AmlRiskIndicator = React.memo<AmlRiskIndicatorProps>(({ screeningResult }) => {
  const { riskScore, riskLevel, flags, walletType } = screeningResult;
  
  const getRiskColor = () => {
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
  
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <ShieldCheck size={32} color={Colors.dark.success} />;
      case 'medium':
        return <ShieldAlert size={32} color={Colors.dark.warning} />;
      case 'high':
      case 'extreme':
        return <ShieldX size={32} color={Colors.dark.danger} />;
      default:
        return null;
    }
  };
  
  const getWalletTypeIcon = () => {
    if (!walletType) return null;
    
    return walletType === 'hot' ? (
      <Thermometer size={20} color={Colors.dark.primary} />
    ) : (
      <Snowflake size={20} color={Colors.dark.primary} />
    );
  };
  
  const getRiskDescription = () => {
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
        return '';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.riskSection}>
          {getRiskIcon()}
          <View style={styles.riskInfo}>
            <Text style={[styles.riskLevel, { color: getRiskColor() }]}>
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
            </Text>
            <Text style={styles.description}>{getRiskDescription()}</Text>
          </View>
        </View>
        
        {walletType && (
          <View style={styles.walletTypeContainer}>
            {getWalletTypeIcon()}
            <Text style={styles.walletTypeText}>
              {walletType.charAt(0).toUpperCase() + walletType.slice(1)} Wallet
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBarContainer}>
          <View 
            style={[
              styles.scoreBar, 
              { 
                width: `${riskScore}%`,
                backgroundColor: getRiskColor(),
              }
            ]} 
          />
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreText}>Risk Score</Text>
          <Text style={[styles.scoreValue, { color: getRiskColor() }]}>
            {riskScore}/100
          </Text>
        </View>
      </View>
      
      {flags.length > 0 && (
        <View style={styles.flagsContainer}>
          <Text style={styles.flagsTitle}>Risk Factors</Text>
          {flags.map((flag, index) => (
            <View key={index} style={styles.flagItem}>
              <View style={[styles.flagDot, { backgroundColor: getRiskColor() }]} />
              <Text style={styles.flagText}>{flag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

AmlRiskIndicator.displayName = 'AmlRiskIndicator';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  riskSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  riskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  riskLevel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  walletTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  walletTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.primary,
    marginLeft: 8,
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  flagsContainer: {
    marginTop: 8,
  },
  flagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  flagText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
});

export default AmlRiskIndicator;