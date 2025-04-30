import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import CustomInput from './components/CustomInput';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from './../config/FirebaseConfig';
import { setLocalStorage } from '../service/Storage';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSignInClick = () => {
  if (!email || !password) {
    Alert.alert("Login", "Please fill all the fields!");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      console.log("User logged in:", user);

      await setLocalStorage('userDetail', user);
      console.log("Login successful, navigating now...");

      await router.replace('/(tabs)/HomeScreen');
    })
    .catch((error) => {
      const errorCode = error.code;

      if (errorCode === "auth/wrong-password") {
        Alert.alert("Login", "Wrong password!");
      } else if (errorCode === "auth/user-not-found") {
        Alert.alert("Login", "User not found!");
      } else if (errorCode === "auth/invalid-email") {
        Alert.alert("Login", "Invalid email!");
      } else {
        Alert.alert("Login", "Something went wrong!");
      }

      console.error("Login error:", errorCode, error.message);
    });
};


  return (
    <View style={styles.container}>
      <Text style={[styles.title,{marginTop:15,marginBottom:4}]}>Hey,</Text>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={[styles.subTitle, { fontSize: 14, marginBottom: 10, marginTop: 15 }]}>
        Please login to continue
      </Text>

      <CustomInput placeholder="Email" onChangeText={(value) => setEmail(value)} />
      <CustomInput placeholder="Password" secureTextEntry onChangeText={(value) => setPassword(value)} />

      <Text
        style={[styles.link, { textAlign: 'right', marginTop: 5, marginBottom: 10 }]}
        onPress={() => router.push('/ForgetPassword')}
      >
        Forgot Password?
      </Text>

      <TouchableOpacity style={styles.btn} onPress={onSignInClick}>
        <Text style={{ color: "white", textAlign: "center", fontSize: 17 }}>Login</Text>
      </TouchableOpacity>

      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={[styles.link, { color: 'black' }]}>
          Don't have an account?
        </Text>
        <Pressable onPress={() => router.push('/SignUp')}>
          <Text style={[styles.link, { marginLeft: 5 }]}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  subTitle: { fontSize: 26, fontWeight: 'bold', color: 'grey', marginBottom: 20 },
  btn: { marginTop: 15, backgroundColor: "#00c26f", padding: 10, borderRadius: 5, color: "white" },
  link: { marginTop: 15, color: "#00c26f", textAlign: 'center' },
});
