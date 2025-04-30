import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { auth, db } from '../../config/FirebaseConfig';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { getLikesCount } from '../../config/likes';
import { getCommentsCount } from '../../config/comments';
import Ionicons from '@expo/vector-icons/Ionicons';

const OtherUserProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId || !authUser) return;
    fetchAllData();
  }, [userId, authUser]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserInfo(userId),
        fetchUserPosts(userId),
        checkIfFollowing(userId),
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
    setLoading(false);
  };

  const fetchUserInfo = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserInfo({ id: uid, ...userSnap.data() });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchUserPosts = async (uid) => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('userId', '==', uid));
      const snapshot = await getDocs(q);

      const postsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const postId = docSnap.id;

          let likesCount = 0;
          let commentsCount = 0;

          try {
            likesCount = await getLikesCount(postId);
          } catch (error) {
            console.error('Failed to fetch likes:', error);
          }

          try {
            commentsCount = await getCommentsCount(postId);
          } catch (error) {
            console.error('Failed to fetch comments:', error);
          }

          return {
            id: postId,
            ...data,
            likesCount,
            commentsCount,
          };
        })
      );

      const sortedPosts = postsData.sort(
        (a, b) => b.createdAt?.seconds - a.createdAt?.seconds
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const checkIfFollowing = async (otherUid) => {
    try {
      if (!authUser) return;
      const currentUserRef = doc(db, 'users', authUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      if (currentUserSnap.exists()) {
        const followingList = currentUserSnap.data().following || [];
        setIsFollowing(followingList.includes(otherUid));
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    try {
      if (!authUser) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const currentUid = authUser.uid;
      const currentUserRef = doc(db, 'users', currentUid);
      const otherUserRef = doc(db, 'users', userId);

      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId),
        });
        await updateDoc(otherUserRef, {
          followers: arrayRemove(currentUid),
        });
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId),
        });
        await updateDoc(otherUserRef, {
          followers: arrayUnion(currentUid),
        });
      }

      setIsFollowing(!isFollowing);
      fetchAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
      console.error('Follow error:', error);
    }
  };

  if (!authUser || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00c26f" />
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.centered}>
        <Text>User not found</Text>
      </View>
    );
  }

  const followersCount = userInfo.followers?.length || 0;
  const followingCount = userInfo.following?.length || 0;
  const postsCount = posts.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userInfo.displayName}</Text>
        <View style={{ width: 26 }} /> {/* For spacing */}
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <Avatar uri={userInfo.profilePicture} size={100} rounded={50} />
            <Text style={styles.userName}>{userInfo.displayName}</Text>
            <Text style={styles.userBio}>{userInfo.bio || 'No bio provided'}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.followButton} onPress={toggleFollow}>
              <Text style={styles.followText}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} authUser={authUser} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

export default OtherUserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  backArrow: {
    fontSize: 26,
    color: '#00c26f',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userBio: {
    fontSize: 14,
    color: '#7c7c7c',
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  followButton: {
    marginTop: 15,
    backgroundColor: '#00c26f',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  followText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
