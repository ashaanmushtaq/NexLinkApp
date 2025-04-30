import { StyleSheet, Text, View, TouchableOpacity, Switch, Image, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router'; // For navigation (if needed)
import Ionicons from '@expo/vector-icons/Ionicons'; // For icons

const SettingScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // For dark mode toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // For notifications toggle
  const router = useRouter(); // To handle navigation

  // Handle dark mode toggle
  const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);

  // Handle notifications toggle
  const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);

  return (
    <View style={[styles.container, isDarkMode && styles.darkMode]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://your-image-url.com' }} // Replace with the user image URL
            style={styles.profileImage}
          />
          <Text style={[styles.profileName, isDarkMode && styles.darkText]}>John Doe</Text>
          <Text style={[styles.profileUsername, isDarkMode && styles.darkText]}>@john_doe</Text>
        </View>

        {/* Settings Options */}
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>General Settings</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/main/editProfile')}>
          <Ionicons name="person-outline" style={styles.settingIcon} />
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/ChangePassword')}>
          <Ionicons name="key-outline" style={styles.settingIcon} />
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Change Password</Text>
        </TouchableOpacity>

        {/* Theme and Notification Toggling */}
        <View style={styles.toggleSection}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Dark Mode</Text>
          <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
        </View>

        <View style={styles.toggleSection}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Enable Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
        </View>

        {/* Log Out */}
        <TouchableOpacity style={[styles.settingItem, styles.logoutButton]} onPress={() => router.push('/Login')}>
          <Ionicons name="log-out-outline" style={styles.settingIcon} />
          <Text style={[styles.settingText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  darkMode: {
    backgroundColor: '#1a1a1a',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileUsername: {
    fontSize: 16,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingIcon: {
    fontSize: 24,
    color: '#333',
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 20,
    paddingTop: 15,
  },
  logoutText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});
