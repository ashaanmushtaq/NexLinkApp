import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/Login')}>
          <Text style={styles.btnText}>Getting Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
  },
  welcomeImage: { 
    width: 260, 
    height: 260, 
    marginTop: 60 
  },
  textContainer: { 
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  title: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    color: '#494949',
    marginBottom: 10
  },
  punchline: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    marginBottom: 50,
  },
  btn: {
    backgroundColor: '#00c26f',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
