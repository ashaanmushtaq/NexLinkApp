import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../../config/FirebaseConfig';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomInput from '../components/CustomInput'; // Import CustomInput

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const user = auth.currentUser;

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        router.back();
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <>
      {/* Updated Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        <Text style={styles.heading}>Update Your Password</Text>

        {/* Use CustomInput component for inputs */}
        <CustomInput
          placeholder="Current Password"
          value={currentPassword}
          iconName="key"
          secureTextEntry
          onChangeText={setCurrentPassword}
        />
        <CustomInput
          placeholder="New Password"
          value={newPassword}
          iconName="lock"
          secureTextEntry
          onChangeText={setNewPassword}
        />
        <CustomInput
          placeholder="Confirm New Password"
          value={confirmPassword}
          iconName="lock"
          secureTextEntry
          onChangeText={setConfirmPassword}
        />

        {/* Updated button */}
        <TouchableOpacity onPress={handleChangePassword} style={styles.btn}>
          <Text style={styles.btnText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00c26f',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 25,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#00c26f",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 10,
    width: '100%', // 👈 input ke barabar width
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  
  btnText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
