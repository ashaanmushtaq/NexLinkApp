import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { auth, db, storage } from '../../config/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomInput from '../components/CustomInput';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProfile = () => {
  const [authUser, setAuthUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    phoneNumber: '',
    image: null,
    bio: '',
    address: '',
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserInfo({
              name: data.displayName || '',
              phoneNumber: data.phoneNumber || '',
              image: data.photoURL || null,
              bio: data.bio || '',
              address: data.address || '',
            });
          }
        } catch (error) {
          console.log('Error fetching user info:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const onPickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setUserInfo((prev) => ({ ...prev, image: asset.uri }));
      setImageFile(asset);
    }
  };

  const handleInputChange = (key, value) => {
    setUserInfo((prev) => ({ ...prev, [key]: value }));
  };

  const uploadImageToFirebase = async () => {
    if (!imageFile || !authUser) return null;
  
    try {
      const response = await fetch(imageFile.uri);
      const blob = await response.blob();
  
      const fileRef = ref(storage, `profileImages/${authUser.uid}.jpg`);
      await uploadBytes(fileRef, blob);
  
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.log('Image upload failed:', error);
      throw error;
    }
  };
  

  const onSubmit = async () => {
    const { name, phoneNumber, address, bio } = userInfo;
    if (!name || !phoneNumber || !address || !bio) {
      Alert.alert('Profile', 'Please fill all the fields!');
      return;
    }

    try {
      let imageUrl = userInfo.image;
      if (imageFile) {
        imageUrl = await uploadImageToFirebase();
      }

      const userRef = doc(db, 'users', authUser.uid);
      await updateDoc(userRef, {
        displayName: name,
        phoneNumber,
        photoURL: imageUrl,
        bio,
        address,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      router.push('/ProfileScreen');
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (!authUser) return null;

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  userInfo.image
                    ? { uri: userInfo.image }
                    : require('../../assets/images/defaultUser.png')
                }
                style={styles.avatar}
              />
              <Pressable style={styles.editIcon} onPress={onPickImage}>
                <Ionicons name="camera-outline" size={20} color="#7c7c7c" />
              </Pressable>
            </View>
            <Text style={styles.userName}>
              {userInfo.name || 'User Name'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
          <CustomInput
            placeholder="Enter your Name"
            value={userInfo.name}
            iconName="user"
            onChangeText={(value) => handleInputChange('name', value)}
          />
          <CustomInput
            placeholder="Enter your Phone Number"
            value={userInfo.phoneNumber}
            iconName="phone"
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
          />
          <CustomInput
            placeholder="Enter your Address"
            value={userInfo.address}
            iconName="home"
            onChangeText={(value) => handleInputChange('address', value)}
          />
          <CustomInput
            placeholder="Enter your Bio"
            // value={userInfo.bio}
            // multiline={true}
            iconName="edit"
            onChangeText={(value) => handleInputChange('bio', value)}
          />

          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.btn} onPress={onSubmit}>
              <Text style={styles.btnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#00c26f',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft:15,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  form: {
    marginTop: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 110,
    height: 110,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#c7c7c7',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#444',
  },
  inputGroup: {
    marginTop: 25,
    gap: 16,
  },
  buttonWrapper: {
    marginTop: 30,
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
  
});
