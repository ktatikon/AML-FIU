import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Token } from '@/types/wallet';

interface TokenCardProps {
  token: Token;
  onPress: () => void;
}

const TokenCard = React.memo<TokenCardProps>(({ token, onPress }) => {
  const isPositiveChange = token.change24h >= 0;
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Image
          source={{ uri: token.logo }}
          style={styles.logo}
          contentFit="contain"
        />
        <View style={styles.tokenInfo}>
          <Text style={styles.symbol}>{token.symbol}</Text>
          <Text style={styles.name}>{token.name}</Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.balance}>{token.balance} {token.symbol}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>${token.value.toLocaleString()}</Text>
          <View style={[
            styles.changeContainer, 
            { backgroundColor: isPositiveChange ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)' }
          ]}>
            {isPositiveChange ? (
              <ArrowUpRight size={12} color={Colors.dark.success} />
            ) : (
              <ArrowDownRight size={12} color={Colors.dark.danger} />
            )}
            <Text style={[
              styles.change,
              { color: isPositiveChange ? Colors.dark.success : Colors.dark.danger }
            ]}>
              {Math.abs(token.change24h).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

TokenCard.displayName = 'TokenCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.dark.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  tokenInfo: {
    marginLeft: 12,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    fontFamily: 'Poppins',
  },
  name: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 2,
    fontFamily: 'Poppins',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    fontFamily: 'Poppins',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  value: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginRight: 8,
    fontFamily: 'Poppins',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
    fontFamily: 'Poppins',
  },
});

export default TokenCard;