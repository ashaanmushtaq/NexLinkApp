import { Platform, View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, ToastAndroid } from 'react-native';
import CustomInput from './components/CustomInput';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { auth } from './../config/FirebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { db } from './../config/FirebaseConfig';
import { setLocalStorage } from '../service/Storage';

export default function SignUp() {
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onCreateAccount = () => {
    if (!userName || !email || !password) {
      Alert.alert("Sign up", "Please fill all the fields!");
      return;
    }

    console.log("Attempting to create account...");

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log("Account created:", user.uid);

        // Update Firebase Auth profile
        await updateProfile(user, { displayName: userName });
        console.log("Profile updated");

        // Save user data to Firestore (users collection)
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: userName,
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
        });
        console.log("User document created in Firestore");

        // Save to local storage
        await setLocalStorage('userDetail', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        console.log("User saved in local storage");

        if (Platform.OS === 'android') {
          ToastAndroid.show('Account created successfully!', ToastAndroid.SHORT);
        }

        await router.replace('/(tabs)/HomeScreen'); // Navigate to home screen
      })
      .catch((error) => {
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

        console.error("Sign up error:", errorCode, error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 15, marginBottom: 4 }]}>Let's</Text>
      <Text style={styles.title}>Get Started</Text>
      <Text style={[styles.subTitle, { fontSize: 14, marginBottom: 10, marginTop: 15 }]}>
        Please fill the details to create an account
      </Text>

      <CustomInput placeholder="Full Name" onChangeText={setUserName} />
      <CustomInput placeholder="Email" onChangeText={setEmail} />
      <CustomInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <TouchableOpacity style={styles.btn} onPress={onCreateAccount}>
        <Text style={{ color: "white", textAlign: "center", fontSize: 17 }}>Sign up</Text>
      </TouchableOpacity>

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
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  subTitle: { fontSize: 26, fontWeight: 'bold', color: 'grey', marginBottom: 20 },
  btn: { marginTop: 15, backgroundColor: "#00c26f", padding: 10, borderRadius: 5 },
  link: { marginTop: 15, color: "#00c26f", textAlign: 'center' },
});
