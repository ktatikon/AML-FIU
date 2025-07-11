import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.memo<ButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.dark.backgroundTertiary;
    
    switch (variant) {
      case 'primary':
        return Colors.dark.primary;
      case 'secondary':
        return Colors.dark.success;
      case 'danger':
        return Colors.dark.danger;
      case 'outline':
        return 'transparent';
      default:
        return Colors.dark.primary;
    }
  };
  
  const getTextColor = () => {
    if (disabled) return Colors.dark.textSecondary;
    
    switch (variant) {
      case 'outline':
        return Colors.dark.primary;
      default:
        return Colors.dark.text;
    }
  };
  
  const getBorderColor = () => {
    if (disabled) return Colors.dark.backgroundTertiary;
    
    switch (variant) {
      case 'outline':
        return Colors.dark.primary;
      default:
        return 'transparent';
    }
  };
  
  const getHeight = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'medium':
        return 48;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getHeight(),
          width: fullWidth ? '100%' : 'auto',
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.title,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;