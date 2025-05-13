import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

const UserDetailScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.warn('No userId provided');
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data());
          // Assume user document has a 'mutedUsers' array
          // and currentUserId is available
          const currentUserId = 'currentUserId'; // Replace with actual current user ID
          setIsMuted(userSnap.data().mutedUsers?.includes(currentUserId));
        } else {
          console.warn('User not found');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleMuteToggle = async () => {
    try {
      const currentUserId = 'currentUserId'; // Replace with actual current user ID
      const userRef = doc(db, 'users', userId);
      if (isMuted) {
        await updateDoc(userRef, {
          mutedUsers: arrayRemove(currentUserId),
        });
      } else {
        await updateDoc(userRef, {
          mutedUsers: arrayUnion(currentUserId),
        });
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleBlockUser = async () => {
    try {
      const currentUserId = 'currentUserId'; // Replace with actual current user ID
      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        blockedUsers: arrayUnion(userId),
      });
      Alert.alert('User Blocked', 'You have successfully blocked this user.');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleReportUser = async () => {
    try {
      const currentUserId = 'currentUserId'; // Replace with actual current user ID
      const currentUserRef = doc(db, 'users', currentUserId);
      await updateDoc(currentUserRef, {
        reportedUsers: arrayUnion(userId),
        following: arrayRemove(userId),
      });
      Alert.alert('User Reported', 'You have successfully reported this user.');
    } catch (error) {
      console.error('Error reporting user:', error);
    }
  };

  const handleDisappearingMessages = () => {
    // Navigate to a screen where user can set disappearing message timer
    router.push(`/chatProfile/SetDisappearingMessages/${userId}`);

  };

  const handleSharedMedia = () => {
    // Navigate to a screen that displays shared media
    router.push(`/chatProfile/SharedMedia/${userId}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00c26f" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push(`/UserProfile/${userId}`)}>
        <Image
          source={{ uri: user?.photoURL || 'https://i.pravatar.cc/300' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <Text style={styles.username}>{user?.displayName || 'Unnamed User'}</Text>
      {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

      <View style={styles.iconRow}>
        <TouchableOpacity
          style={styles.iconBox}
          onPress={() => router.push(`/main/${userId}`)}
        >
          <Ionicons name="person" size={24} color="#000" />
          <Text style={styles.iconLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBox}
          onPress={() => console.log(`/chatProfile/SearchMessages/${userId}`)}
        >
          <Ionicons name="search" size={24} color="#000" />
          <Text style={styles.iconLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBox} onPress={handleMuteToggle}>
          <Ionicons
            name={isMuted ? 'notifications-off' : 'notifications'}
            size={24}
            color="#000"
          />
          <Text style={styles.iconLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBox}
          onPress={() => console.log(`/UserOptions/${userId}`)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
          <Text style={styles.iconLabel}>Options</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.rowItem} onPress={handleBlockUser}>
          <MaterialIcons name="block" size={22} color="red" />
          <Text style={styles.rowText}>Block User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rowItem} onPress={handleReportUser}>
          <Feather name="alert-triangle" size={22} color="orange" />
          <Text style={styles.rowText}>Report User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.rowItem} onPress={handleDisappearingMessages}>
          <Ionicons name="timer" size={22} color="#555" />
          <Text style={styles.rowText}>Disappearing Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rowItem}
          onPress={() => router.push('/chatProfile/PrivacyPolicy')}
        >
          <Ionicons name="document-text" size={22} color="#555" />
          <Text style={styles.rowText}>Privacy & Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rowItem} onPress={handleSharedMedia}>
          <Ionicons name="images" size={22} color="#555" />
          <Text style={styles.rowText}>Shared Media</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UserDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginTop: 20,
  },
  iconBox: {
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  rowText: {
    marginLeft: 10,
    fontSize: 15,
  },
});
