import React from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { ChevronRight, Shield, Bell, Moon, HelpCircle, LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';
import ErrorBoundary from '@/components/ErrorBoundary';

const SettingsScreen = React.memo(() => {
  const [amlEnabled, setAmlEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => {
    return (
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement || <ChevronRight size={20} color={Colors.dark.textSecondary} />}
      </TouchableOpacity>
    );
  };
  
  return (
    <ErrorBoundary>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {renderSettingItem(
          <Shield size={24} color={Colors.dark.primary} />,
          'AML Screening',
          'Screen transactions for compliance',
          <Switch
            value={amlEnabled}
            onValueChange={setAmlEnabled}
            trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
            thumbColor={Colors.dark.text}
          />
        )}
        
        {renderSettingItem(
          <Bell size={24} color={Colors.dark.primary} />,
          'Notifications',
          'Get alerts for transactions',
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
            thumbColor={Colors.dark.text}
          />
        )}
        
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        {renderSettingItem(
          <Moon size={24} color={Colors.dark.primary} />,
          'Dark Mode',
          'Currently enabled',
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
            thumbColor={Colors.dark.text}
          />
        )}
        
        <Text style={styles.sectionTitle}>Support</Text>
        
        {renderSettingItem(
          <HelpCircle size={24} color={Colors.dark.primary} />,
          'Help Center',
          'Get help with your wallet',
          undefined,
          () => console.log('Help Center pressed')
        )}
        
        <View style={styles.logoutContainer}>
          {renderSettingItem(
            <LogOut size={24} color={Colors.dark.danger} />,
            'Log Out',
            undefined,
            undefined,
            () => console.log('Log Out pressed')
          )}
        </View>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </ErrorBoundary>
  );
});

SettingsScreen.displayName = 'SettingsScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 24,
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    fontFamily: 'Poppins',
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 2,
    fontFamily: 'Poppins',
  },
  logoutContainer: {
    marginTop: 24,
  },
  versionText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
});

export default SettingsScreen;