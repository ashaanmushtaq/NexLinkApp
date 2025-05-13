import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// Import Firestore if needed for media query

export default function SharedMedia() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Replace this with your Firestore logic
        const dummyMedia = [
          { id: '1', uri: 'https://placekitten.com/200/200' },
          { id: '2', uri: 'https://placekitten.com/201/201' },
        ];
        setMediaList(dummyMedia);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [userId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#00c26f" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Shared Media with User</Text>
      <FlatList
        data={mediaList}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.image} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
});
