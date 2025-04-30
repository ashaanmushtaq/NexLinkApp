import { StyleSheet, Text, View, Image, Button, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        style={styles.welcomeImage}
        resizeMode="contain"
        source={require('../assets/images/welcome.png')}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Nexlink!</Text>
        <Text style={styles.punchline}>
          Where every thought finds a home and every image tells a story
        </Text>
      </View>
      <View style={styles.footer}>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/Login')} >
        <Text style={{color:"white", textAlign:"center", fontSize:17}}>Getting Started</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  welcomeImage: { width: 250, height: 250, marginBottom: 20 },
  textContainer: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#494949' },
  punchline: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, paddingHorizontal: 10 },
  footer: { marginTop: 20 },
  btn:{marginTop:15, backgroundColor:"#00c26f", padding:10, borderRadius:5, color:"white"},
});
