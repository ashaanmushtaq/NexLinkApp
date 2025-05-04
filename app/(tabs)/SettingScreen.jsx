import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Modal, Alert
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth, db } from '../../config/FirebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import Avatar from '../components/Avatar'; // Custom component

const SettingScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    profilePicture: '',
  });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const router = useRouter();

  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

  const fetchUserInfo = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserInfo({
          displayName: data.displayName || 'User',
          profilePicture: data.profilePicture || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    try {
      if (user) {
        await deleteDoc(doc(db, 'users', user.uid)); // Remove from Firestore
        await user.delete(); // Delete Firebase Auth account
        router.replace('/Login');
      }
    } catch (error) {
      Alert.alert('Error', 'Please re-authenticate to delete your account.');
      console.error('Delete account error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar uri={userInfo.profilePicture} size={100} rounded={50} />
          <Text style={styles.profileName}>{userInfo.displayName}</Text>
        </View>

        {/* Settings Options */}
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Enable Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/main/editProfile')}>
          <Text style={styles.settingText}>Edit Profile</Text>
          <Ionicons name="person-outline" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/main/ChangePassword')}>
          <Text style={styles.settingText}>Change Password</Text>
          <Ionicons name="lock-closed-outline" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/main/PrivacyPolicy')}>
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Ionicons name="document-text-outline" size={20} color="#555" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutModalVisible(true)}>
          <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
          <Text style={[styles.settingText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
          <Ionicons name="trash-outline" size={20} color="#ff0000" />
          <Text style={[styles.settingText, styles.deleteText]}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text>Are you sure you want to log out?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.modalConfirm}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text>This will permanently delete your account.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount}>
                <Text style={styles.modalDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00c26f',
    padding: 15,
  },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  scrollViewContent: { padding: 20 },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  profileName: { marginTop: 10, fontSize: 18, fontWeight: 'bold' },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  settingText: { fontSize: 16 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  deleteText: {
    fontSize: 16,
    color: '#ff0000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 20,
  },
  modalCancel: {
    color: '#555',
    fontWeight: 'bold',
  },
  modalConfirm: {
    color: 'red',
    fontWeight: 'bold',
  },
  modalDelete: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
});
