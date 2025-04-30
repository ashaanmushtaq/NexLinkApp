import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../../config/FirebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NewPost = () => {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState(null);

  const pickMedia = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted === false) {
      Alert.alert("Permission denied", "We need access to your media to proceed.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0]);
    }
  };

  const uploadMediaToFirebase = async () => {
    if (!media) return null;
    const res = await fetch(media.uri);
    const blob = await res.blob();

    const fileType = media.type === 'video' ? 'videos' : 'images';
    const fileRef = ref(storage, `${fileType}/${Date.now()}`);
    await uploadBytes(fileRef, blob);

    return await getDownloadURL(fileRef);
  };

  const handlePost = async () => {
    const htmlCaption = caption.trim();

    if (!htmlCaption && !media) {
      Alert.alert("Empty Post", "Please add a caption or media.");
      return;
    }

    try {
      const mediaUrl = await uploadMediaToFirebase();

      await addDoc(collection(db, 'posts'), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        caption: htmlCaption,
        mediaUrl: mediaUrl || '',
        mediaType: media?.type || '',
        createdAt: serverTimestamp(),
      });

      setCaption('');
      setMedia(null);
      Alert.alert("Success", "Your post has been uploaded!");
      router.back();
    } catch (error) {
      console.error("Failed to upload post:", error);
      Alert.alert("Error", "Failed to post. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#1d1d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Post</Text>
        <View style={{ width: 28 }} /> {/* Spacer */}
      </View>

      {/* Media Box */}
      <TouchableOpacity style={styles.mediaBox} onPress={pickMedia}>
        {media ? (
          media.type === 'image' ? (
            <Image source={{ uri: media.uri }} style={styles.media} />
          ) : (
            <View style={styles.centered}>
              <Ionicons name="videocam" size={40} color="#9e9e9e" />
              <Text style={styles.mediaText}>Video Selected</Text>
            </View>
          )
        ) : (
          <View style={styles.centered}>
            <Ionicons name="camera" size={40} color="#9e9e9e" />
            <Text style={styles.mediaText}>Tap to add image or video</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption Input */}
      <Text style={{ marginBottom: 5, fontSize: 16 }}>Caption:</Text>
      <View style={styles.captionBox}>
        <TextInput
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          style={{ fontSize: 16, padding: 10 }}
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  mediaBox: {
    backgroundColor: '#f1f1f1',
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaText: {
    marginTop: 8,
    color: '#9e9e9e',
    fontSize: 16,
  },
  captionBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#fafafa',
    minHeight: 100,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: '#00c26f',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});
