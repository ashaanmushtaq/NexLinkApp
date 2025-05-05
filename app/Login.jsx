import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import CustomInput from './components/CustomInput';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../config/FirebaseConfig';
import { setLocalStorage } from '../service/Storage';
import { LinearGradient } from 'expo-linear-gradient';

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
      <LinearGradient
        colors={['#00c26f', 'rgba(0, 194, 111, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <Text style={styles.title}>Hey,</Text>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subTitle}>Please login to continue</Text>

      <CustomInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        iconName="mail"
      />

      <CustomInput 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
        iconName="lock"
      />

      <Text 
        style={styles.link} 
        onPress={() => router.push('/ForgetPassword')}>
        Forgot Password?
      </Text>

      <TouchableOpacity style={styles.btn} onPress={onSignInClick}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Pressable onPress={() => router.push('/SignUp')}>
          <Text style={styles.footerLink}>Sign Up</Text>
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
    alignItems: 'center',
    backgroundColor:'#fff'
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
  link: {
    color: '#00c26f',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
    marginBottom: 30,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#7c7c7c',
  },
  footerLink: {
    color: '#00c26f',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
