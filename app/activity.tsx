import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useWalletStore } from '@/hooks/useWalletStore';
import TransactionItem from '@/components/TransactionItem';
import ErrorBoundary from '@/components/ErrorBoundary';

const ActivityScreen = React.memo(() => {
  const router = useRouter();
  const { wallet } = useWalletStore();
  
  const handleTransactionPress = (transactionId: string) => {
    router.push({
      pathname: '/transaction-details',
      params: { id: transactionId }
    });
  };
  
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <FlatList
          data={wallet.transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem 
              transaction={item} 
              onPress={() => handleTransactionPress(item.id)} 
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.title}>Transaction History</Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
        />
      </View>
    </ErrorBoundary>
  );
});

ActivityScreen.displayName = 'ActivityScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  listContent: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontFamily: 'Poppins',
  },
});

export default ActivityScreen;