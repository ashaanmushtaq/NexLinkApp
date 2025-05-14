import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditPostScreen = () => {
  const { postId } = useLocalSearchParams();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const snap = await getDoc(postRef);
        if (snap.exists()) {
          const data = snap.data();
          setCaption(data.caption || '');
          if (data.mediaUrl) {
            setMedia({
              uri: data.mediaUrl,
              type: data.mediaType,
              existing: true, // helps avoid re-upload unless changed
            });
          }
        } else {
          Alert.alert('Post not found');
          router.back();
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        Alert.alert('Failed to fetch post.');
      }
    };

    fetchPost();
  }, [postId]);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Media library access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0]);
    }
  };

  const uploadMediaToFirebase = async () => {
    if (!media || media.existing) return null;

    const res = await fetch(media.uri);
    const blob = await res.blob();
    const fileRef = ref(storage, `images/${Date.now()}`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async () => {
    if (!caption.trim() && !media) {
      Alert.alert('Empty Post', 'Please add a caption or media.');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      if (!media?.existing) {
        mediaUrl = await uploadMediaToFirebase();
      }

      const updates = {
        caption: caption.trim(),
        updatedAt: serverTimestamp(),
      };

      if (mediaUrl) {
        updates.mediaUrl = mediaUrl;
        updates.mediaType = media.type || 'image';
      }

      await updateDoc(doc(db, 'posts', postId), updates);

      Alert.alert('Success', 'Post updated!');
      router.back();
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#1d1d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Media Box */}
      <TouchableOpacity style={styles.mediaBox} onPress={pickMedia}>
        {media ? (
          <Image source={{ uri: media.uri }} style={styles.media} />
        ) : (
          <View style={styles.centered}>
            <Ionicons name="camera" size={40} color="#9e9e9e" />
            <Text style={styles.mediaText}>Tap to select image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption Input */}
      <Text style={styles.label}>Edit Caption</Text>
      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Update your caption..."
        style={styles.input}
        multiline
      />

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSave}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EditPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#00c26f',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
