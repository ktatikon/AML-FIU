import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { ClipboardList, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

const AddressInput = React.memo<AddressInputProps>(({
  value,
  onChangeText,
  placeholder = 'Enter wallet address',
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleClear = () => {
    onChangeText('');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Wallet Address</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
        ]}
      >
        <ClipboardList size={20} color={Colors.dark.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.dark.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {value ? (
          <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
            <X size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

AddressInput.displayName = 'AddressInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.dark.text,
  },
  focused: {
    borderColor: Colors.dark.primary,
  },
  error: {
    borderColor: Colors.dark.danger,
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark.danger,
    marginTop: 4,
  },
  iconButton: {
    padding: 4,
  },
});

export default AddressInput;