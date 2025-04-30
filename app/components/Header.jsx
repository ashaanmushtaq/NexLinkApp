import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const Header = ({title}) => {
    const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title || ""}</Text>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:5,
        marginBottom:15,
      },
      text: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#494949',
      },
})