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
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Entypo from '@expo/vector-icons/Entypo';
import useSendNotification from '../../context/useSendNotification';

const OtherUserProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  const sendNotification = useSendNotification();
 
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

        const senderSnap = await getDoc(currentUserRef);
        const senderName = senderSnap.exists() ? senderSnap.data().displayName : 'Someone';

        await sendNotification(
          userId,
          'started following you',
          '',
          senderName,
          ''
        );
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userInfo.displayName}</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item, index) => item.id || index.toString()}
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

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%', marginTop: 12 }}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing ? styles.unfollowButton : styles.followButtonActive,
                ]}
                onPress={toggleFollow}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {/* Show the correct icon based on the follow state */}
                  {isFollowing ? (
                    <Entypo name="remove-user" size={20} color="#00c26f" />
                  ) : (
                    <Entypo name="add-user" size={20} color="white" />
                  )}
                  <Text
                    style={[
                      styles.followText,
                      isFollowing ? styles.unfollowText : styles.followTextActive,
                      { marginLeft: 8 }, // Space between icon and text
                    ]}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Text>
                </View>
              </TouchableOpacity>

              {isFollowing && (
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1.2,
                    marginTop: 10,
                    marginLeft: 15, // Space between unfollow and message button
                    alignSelf: 'center',
                    borderColor: '#00c26f',
                  }}
                  onPress={() => router.push(`/messenger/${userId}`)} // 👈 Navigate to chat
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome5 name="facebook-messenger" size={20} color="#00c26f" />
                    <Text
                      style={{
                        color: '#00c26f',
                        fontWeight: 'bold',
                        marginLeft: 8, // Space between icon and text
                      }}
                    >
                      Message
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>




          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            user={authUser}
            navigateToUserProfile={(userId) => router.push(`/user/${userId}`)}
            handleUnfollow={(userId) => console.log('Unfollow user:', userId)}
            handleDelete={(postId) => console.log('Delete post:', postId)}
            handleHide={(postId) => console.log('Hide post:', postId)}
            navigateToComments={(postId) => router.push(`/comments/${postId}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.noPostText}>No posts to show</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default OtherUserProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  backArrow: { fontSize: 26, color: '#00c26f', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  profileSection: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  userBio: {
    fontSize: 14,
    color: '#7c7c7c',
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: { flexDirection: 'row', marginTop: 10 },
  statBox: { alignItems: 'center', marginHorizontal: 15 },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#888' },

  followButton: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
  },
  followButtonActive: {
    backgroundColor: '#00c26f',
    borderColor: '#00c26f',
  },
  unfollowButton: {
    backgroundColor: '#fff',
    borderColor: '#00c26f',
  },
  followText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  followTextActive: {
    color: 'white',
  },
  unfollowText: {
    color: '#00c26f',
  },
  messageButton: {
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#007bff',
  },
  messageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },  
  noPostText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});
