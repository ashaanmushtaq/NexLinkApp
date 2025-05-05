import React from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import CustomInput from './components/CustomInput';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/FirebaseConfig';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

export default function ForgetPassword() {
  const router = useRouter();

  const handleResetPassword = async (values, { resetForm }) => {
    try {
      await sendPasswordResetEmail(auth, values.email);
      Alert.alert('Success', 'Reset link sent to your email');
      resetForm();
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

      <Formik
        initialValues={{ email: '' }}
        validationSchema={validationSchema}
        onSubmit={handleResetPassword}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <CustomInput
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              iconName="mail"
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
              <Text style={styles.btnText}>Send Reset Link</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>

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
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
});
