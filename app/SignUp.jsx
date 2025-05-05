import { Platform, View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, ToastAndroid } from 'react-native';
import CustomInput from './components/CustomInput';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { auth } from './../config/FirebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { db } from './../config/FirebaseConfig';
import { setLocalStorage } from '../service/Storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';

const SignUpSchema = Yup.object().shape({
  userName: Yup.string().required('Full Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function SignUp() {
  const router = useRouter();

  const onCreateAccount = async (values, { setSubmitting }) => {
    const { userName, email, password } = values;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: userName });

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: userName,
        displayName_lower: userName.toLowerCase(),
        photoURL: user.photoURL || "",
        phoneNumber: user.phoneNumber || "",
        bio: "",
        gender: "",
        dob: "",
        location: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnline: true,
        interests: [],
        username: "",
        coverPhoto: ""
      };

      await setDoc(doc(db, "users", user.uid), userData);

      await setLocalStorage('userDetail', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      if (Platform.OS === 'android') {
        ToastAndroid.show('Account created successfully!', ToastAndroid.SHORT);
      }

      router.replace('/(tabs)/HomeScreen');
    } catch (error) {
      const errorCode = error.code;
      if (Platform.OS === 'android') {
        if (errorCode === 'auth/email-already-in-use') {
          ToastAndroid.show('Email already in use', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
      } else {
        Alert.alert("Sign Up Error", error.message);
      }
    } finally {
      setSubmitting(false);
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

      <Text style={[styles.title, { marginTop: 15, marginBottom: 4 }]}>Let's</Text>
      <Text style={styles.title}>Get Started</Text>
      <Text style={[styles.subTitle, { fontSize: 14, marginBottom: 10, marginTop: 15 }]}>
        Please fill the details to create an account
      </Text>

      <Formik
        initialValues={{ userName: '', email: '', password: '' }}
        validationSchema={SignUpSchema}
        onSubmit={onCreateAccount}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <CustomInput
              placeholder="Full Name"
              onChangeText={handleChange('userName')}
              onBlur={handleBlur('userName')}
              value={values.userName}
              iconName="user"
              error={touched.userName && errors.userName}
            />

            <CustomInput
              placeholder="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              iconName="mail"
              error={touched.email && errors.email}
            />

            <CustomInput
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              iconName="lock"
              error={touched.password && errors.password}
            />

            <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.btnText}>{isSubmitting ? 'Creating...' : 'Sign up'}</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={[styles.link, { color: 'black' }]}>Already have an account?</Text>
        <Pressable onPress={() => router.push('/Login')}>
          <Text style={[styles.link, { marginLeft: 5 }]}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#00c26f",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
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
    marginTop: 15,
    color: "#00c26f",
    textAlign: 'center',
    fontWeight: '500',
  },
});
