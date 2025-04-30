import { View, Text, Button, StyleSheet } from 'react-native';
import CustomInput from './components/CustomInput';
import { useRouter } from 'expo-router';

export default function ForgetPassword() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <CustomInput placeholder="Enter your email" />
      <View style={styles.btn}>
      <Button title="Send Reset Link" onPress={() => {}} />
        </View>
      <Text style={styles.link} onPress={() => router.push('/Login')}>
        Go back to Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  btn:{marginTop:15},
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
});
