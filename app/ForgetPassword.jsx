import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import CustomInput from './components/CustomInput';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/FirebaseConfig';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#00c26f', 'rgba(0, 194, 111, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subTitle}>Enter your email to reset it</Text>

      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        iconName="mail"
      />

      <TouchableOpacity style={styles.btn} onPress={handleResetPassword}>
        <Text style={styles.btnText}>Send Reset Link</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => router.push('/Login')}>
        Back to Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    height: '45%',
    width: '110%',
    borderBottomRightRadius: 1000,
    opacity: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: '#7c7c7c',
    textAlign: 'center',
    marginBottom: 30,
  },
  btn: {
    backgroundColor: "#00c26f",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 10,
    width: '100%',
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
  link: {
    color: '#00c26f',
    fontSize: 14,
    marginTop: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
