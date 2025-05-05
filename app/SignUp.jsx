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

        // Store displayName_lower for backend use only
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

        // Save user data to Firestore (users collection)
        await setDoc(doc(db, "users", user.uid), userData);
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

      <CustomInput 
        placeholder="Full Name" 
        onChangeText={setUserName} 
        iconName="user" 
      />

      <CustomInput 
        placeholder="Email" 
        onChangeText={setEmail} 
        iconName="mail" 
      />

      <CustomInput 
        placeholder="Password" 
        secureTextEntry 
        onChangeText={setPassword} 
        iconName="lock" 
      />

      <TouchableOpacity style={styles.btn} onPress={onCreateAccount}>
        <Text style={styles.btnText}>Sign up</Text>
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
