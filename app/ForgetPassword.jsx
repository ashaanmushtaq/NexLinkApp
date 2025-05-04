import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import CustomInput from './components/CustomInput';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/FirebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Reset link sent to your email');
      setEmail('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <>
      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.heading}>Enter your email to reset password</Text>

        <CustomInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => router.push('/Login')}>
          Go back to Login
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 25,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#00c26f',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 25,
    color: 'blue',
    textAlign: 'center',
    fontSize: 14,
  },
});
