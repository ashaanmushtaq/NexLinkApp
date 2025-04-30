import {  
  StyleSheet,  
  Text,  
  TouchableOpacity,  
  View,  
  Alert,  
  Pressable,  
  SafeAreaView,  
  ActivityIndicator,  
  FlatList  
} from 'react-native';  
import React, { useEffect, useState } from 'react';  
import { auth, db } from '../../config/FirebaseConfig';  
import { useRouter } from 'expo-router';  
import { onAuthStateChanged, signOut } from 'firebase/auth';  
import {  
  doc,  
  getDoc,  
  collection,  
  query,  
  where,  
  getDocs,  
  deleteDoc  
} from 'firebase/firestore';  
import Header from '../components/Header';  
import AntDesign from '@expo/vector-icons/AntDesign';  
import Avatar from '../components/Avatar';  
import PostCard from '../components/PostCard';  
import { getLikesCount } from '../../config/likes';  
import { getCommentsCount } from '../../config/comments';  
import Ionicons from '@expo/vector-icons/Ionicons';  

const ProfileScreen = () => {  
  const router = useRouter();  
  const [user, setUser] = useState(null);  
  const [userInfo, setUserInfo] = useState({  
    displayName: '',  
    phoneNumber: '',  
    bio: '',  
    address: '',  
    profilePicture: '',  
  });  
  const [loading, setLoading] = useState(true);  
  const [userPosts, setUserPosts] = useState([]);  
  const [followersCount, setFollowersCount] = useState(0);  
  const [followingCount, setFollowingCount] = useState(0);  

  const onLogout = async () => {  
    try {  
      await signOut(auth);  
      router.replace('/Login');  
    } catch (e) {  
      console.error('Logout failed', e);  
    }  
  };  

  const handleLogout = () => {  
    Alert.alert('Confirm', 'Are you sure you want to log out?', [  
      { text: 'Cancel', style: 'cancel' },  
      { text: 'Logout', onPress: onLogout, style: 'destructive' },  
    ]);  
  };  

  const fetchUserDetails = async (uid) => {  
    try {  
      const userRef = doc(db, 'users', uid);  
      const userSnap = await getDoc(userRef);  

      if (userSnap.exists()) {  
        const data = userSnap.data();  
        setUserInfo({  
          displayName: data.displayName || '',  
          phoneNumber: data.phoneNumber || '',  
          bio: data.bio || '',  
          address: data.address || '',  
          profilePicture: data.profilePicture || '',  
        });  
        setFollowersCount(data.followers?.length || 0);  
        setFollowingCount(data.following?.length || 0);  
      }  
    } catch (error) {  
      console.error('Failed to fetch user details:', error);  
    }  
  };  

  const fetchUserPosts = async (uid) => {  
    try {  
      const postsRef = collection(db, 'posts');  
      const q = query(postsRef, where('userId', '==', uid));  
      const querySnapshot = await getDocs(q);  

      const posts = await Promise.all(  
        querySnapshot.docs.map(async (docSnap) => {  
          const data = docSnap.data();  
          const postId = docSnap.id;  

          // Likes Count  
          let likesCount = 0;  
          try {  
            likesCount = await getLikesCount(postId);  
          } catch (error) {  
            console.error('Failed to fetch likes:', error);  
          }  

          // Comments Count  
          let commentsCount = 0;  
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

      posts.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);  
      setUserPosts(posts);  
    } catch (error) {  
      console.error('Failed to fetch user posts:', error);  
    }  
  };  

  const handleDeletePost = async (postId) => {  
    Alert.alert('Confirm', 'Are you sure you want to delete this post?', [  
      { text: 'Cancel', style: 'cancel' },  
      {  
        text: 'Delete',  
        onPress: async () => {  
          try {  
            await deleteDoc(doc(db, 'posts', postId));  
            setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));  
            Alert.alert('Success', 'Post deleted successfully.');  
          } catch (error) {  
            console.error('Error deleting post:', error);  
            Alert.alert('Error', 'Failed to delete post.');  
          }  
        },  
        style: 'destructive',  
      },  
    ]);  
  };  

  useEffect(() => {  
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {  
      if (authUser) {  
        setUser(authUser);  
        await fetchUserDetails(authUser.uid);  
        await fetchUserPosts(authUser.uid);  
        setLoading(false);  
      } else {  
        router.replace('/Login');  
      }  
    });  

    return () => unsubscribe();  
  }, []);  

  if (loading) {  
    return (  
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>  
        <ActivityIndicator size="large" color="#00c26f" />  
      </View>  
    );  
  }  

  if (!user) return null;  

  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>  
          <Ionicons name="arrow-back" style={styles.backArrow} />  
        </TouchableOpacity>  
        <Text style={styles.headText}>Profile</Text>  
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>  
          <AntDesign name="poweroff" size={24} color="red" />  
        </TouchableOpacity>  
      </View>  

      <FlatList  
        ListHeaderComponent={  
          <>  
            <View style={styles.profileSection}>  
              <View style={styles.avatarContainer}>  
                <Avatar uri={userInfo.profilePicture} size={100} rounded={50} />  
                <Pressable style={styles.editIcon} onPress={() => router.push('/main/editProfile')}>  
                  <AntDesign name="edit" size={18} color="#555" />  
                </Pressable>  
              </View>  

              <Text style={styles.userName}>{userInfo.displayName || 'User'}</Text>  
              {userInfo.bio ? <Text style={styles.userBio}>{userInfo.bio}</Text> : null}  

              <View style={styles.statsRow}>  
                <View style={styles.statItem}>  
                  <Text style={styles.statNumber}>{userPosts.length}</Text>  
                  <Text style={styles.statLabel}>Posts</Text>  
                </View>  
                <View style={styles.statItem}>  
                  <Text style={styles.statNumber}>{followersCount}</Text>  
                  <Text style={styles.statLabel}>Followers</Text>  
                </View>  
                <View style={styles.statItem}>  
                  <Text style={styles.statNumber}>{followingCount}</Text>  
                  <Text style={styles.statLabel}>Following</Text>  
                </View>  
              </View>  

              <View style={{ marginTop: 15 }}>  
                <View style={styles.info}>  
                  <AntDesign name="mail" size={22} color="#7c7c7c" style={{ marginRight: 10 }} />  
                  <Text style={styles.infoText}>{user?.email || 'No email available'}</Text>  
                </View>  

                {userInfo.phoneNumber ? (  
                  <View style={styles.info}>  
                    <AntDesign name="phone" size={22} color="#7c7c7c" style={{ marginRight: 10 }} />  
                    <Text style={styles.infoText}>{userInfo.phoneNumber}</Text>  
                  </View>  
                ) : null}  
                {userInfo.address ? (  
                  <View style={styles.info}>  
                    <AntDesign name="home" size={22} color="#7c7c7c" style={{ marginRight: 10 }} />  
                    <Text style={styles.infoText}>{userInfo.address}</Text>  
                  </View>  
                ) : null}  
              </View>  
            </View>  
          </>  
        }  
        data={userPosts}  
        keyExtractor={(item) => item.id}  
        renderItem={({ item }) => (  
          <PostCard  
            post={item}  
            user={user}  
            navigateToUserProfile={(userId) => router.push(`/profile/${userId}`)}  
            handleDelete={() => handleDeletePost(item.id)}  
          />  
        )}  
      />  
    </SafeAreaView>  
  );  
};  

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: 'white',  
  },  
  header: {  
    flexDirection: 'row',  
    padding: 10,  
    backgroundColor: '#fff',  
    alignItems: 'center',  
    justifyContent: 'space-between',  
    elevation: 5,  
  },  
  logoutButton: {  
    padding: 10,  
  },  
  profileSection: {  
    alignItems: 'center',  
    marginBottom: 15,  
    paddingHorizontal: 20,  
  },  
  avatarContainer: {  
    position: 'relative',  
    marginBottom: 10,  
    marginTop: 10,  
  },  
  editIcon: {  
    position: 'absolute',  
    right: 0,  
    bottom: 0,  
    backgroundColor: '#fff',  
    padding: 4,  
    borderRadius: 12,  
  },  
  headText: {  
    fontSize: 20,  
    fontWeight: 'bold',  
    color: '#00c26f',  
    marginLeft: 25,  
  },  
  backButton: {  
    padding: 5,  
  },  
  backArrow: {  
    fontSize: 26,  
    color: '#00c26f',  
    fontWeight: 'bold',  
  },  
  userName: {  
    fontSize: 22,  
    fontWeight: 'bold',  
    marginTop: 5,  
  },  
  userBio: {  
    fontSize: 14,  
    color: '#7c7c7c',  
    textAlign: 'center',  
    marginTop: 5,  
  },  
  statsRow: {  
    flexDirection: 'row',  
    justifyContent: 'space-around',  
    width: '100%',  
    marginTop: 10,  
  },  
  statItem: {  
    alignItems: 'center',  
  },  
  statNumber: {  
    fontSize: 18,  
    fontWeight: 'bold',  
  },  
  statLabel: {  
    fontSize: 14,  
    color: '#7c7c7c',  
  },  
  info: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginVertical: 5,  
  },  
  infoText: {  
    fontSize: 14,  
    color: '#555',  
  },  
});  

export default ProfileScreen;
