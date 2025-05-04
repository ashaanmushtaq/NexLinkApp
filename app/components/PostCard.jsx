import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Avatar from './Avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Ionicons } from '@expo/vector-icons';
import MenuModal from '../components/MenuModal';
import CommentsModal from '../components/CommentsModal';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import {
  followUser,
  unfollowUser,
  isFollowing,
} from '../../service/followService';
import {
  isPostLiked,
  getLikesCount,
  likePost,
  unlikePost,
} from '../../config/likes';
import { getCommentsCount } from '../../config/comments';
import useSendNotification from '../../context/useSendNotification';

dayjs.extend(relativeTime);

const PostCard = ({ post, user, handleUnfollow, handleDelete, handleHide }) => {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isFollowingUser, setIsFollowingUser] = useState(false);

  const sendNotification = useSendNotification();

  const postTime = post?.createdAt
    ? dayjs(post.createdAt.toDate ? post.createdAt.toDate() : post.createdAt).fromNow()
    : '';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchPostStats = async () => {
      if (!post?.id || !user || !authUser?.uid) return;

      try {
        const [likedStatus, totalLikes, totalComments, followingStatus] = await Promise.all([
          isPostLiked(post.id, authUser.uid),
          getLikesCount(post.id),
          getCommentsCount(post.id),
          isFollowing(authUser.uid, post.userId),
        ]);
        setLiked(likedStatus);
        setLikesCount(totalLikes);
        setCommentsCount(totalComments);
        setIsFollowingUser(followingStatus);
      } catch (err) {
        console.error('Error loading post stats:', err);
      }
    };

    fetchPostStats();
  }, [post?.id, authUser?.uid]);

  const handleLikeToggle = async (postId, toUserId, senderName) => {
    if (!authUser?.uid || !post?.id) return;
  
    try {
      setLoading(true);
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
  
      if (liked) {
        await unlikePost(post.id, authUser.uid);
        setLikesCount((prev) => Math.max(prev - 1, 0));
      } else {
        await likePost(post.id, authUser.uid);
        setLikesCount((prev) => prev + 1);
  
        // Only send notification if the post owner is not the authUser
        if (post.userId !== authUser.uid) {
          await sendNotification(toUserId, 'liked your post', postId, senderName, post.caption);
        }
      }
  
      setLiked(!liked);
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  };
  

  const onViewProfile = (userId) => {
    setOptionsVisible(false);
    router.push(authUser?.uid === userId ? '/(tabs)/ProfileScreen' : `/main/${userId}`);
  };

  const handleDeletePost = async () => {
    if (!post?.id) return;
    try {
      await db.collection('posts').doc(post.id).delete();
      handleDelete(post.id);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleHidePost = () => {
    if (post?.id) {
      handleHide(post.id);
      setOptionsVisible(false);
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Avatar uri={post?.userPhoto} size={32} rounded={16} />
        <View>
          <Text style={styles.userName}>{post?.userName}</Text>
          <Text style={styles.time}>{postTime}</Text>
        </View>
        <TouchableOpacity onPress={() => setOptionsVisible(true)} style={styles.menuIcon}>
          <Ionicons name="ellipsis-vertical" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Media */}
      {post?.mediaUrl && post.mediaType === 'image' && (
        <RNImage source={{ uri: post.mediaUrl }} style={styles.postImage} resizeMode="cover" />
      )}
      {post?.mediaUrl && post.mediaType === 'video' && (
        <View style={styles.videoBox}>
          <Text style={styles.videoText}>Video Uploaded</Text>
        </View>
      )}

      {/* Caption */}
      <Text style={styles.caption}>{post?.caption}</Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => handleLikeToggle(post.id, post.userId, authUser?.displayName)}
          style={styles.actionBtn}
          disabled={loading}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? 'red' : 'gray'} />
          </Animated.View>
          {loading ? (
            <ActivityIndicator size="small" color="#999" />
          ) : (
            <Text style={styles.countText}>{likesCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCommentsVisible(true)} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="gray" />
          <Text style={styles.countText}>{commentsCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <MenuModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        post={post}
        authUser={authUser}
        onViewProfile={onViewProfile}
        onUnfollow={handleUnfollow}
        onDelete={handleDeletePost}
        onHide={handleHidePost}
        isFollowingUser={isFollowingUser}
      />
      <CommentsModal
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        postId={post.id}
        user={user}
        onCommentPosted={() => setCommentsCount((prev) => prev + 1)}
      />
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: { fontSize: 16, fontWeight: 'bold' },
  time: { fontSize: 12, color: '#888' },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  videoBox: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 8,
  },
  videoText: { fontSize: 16, color: '#555' },
  caption: { fontSize: 14, color: '#333', marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'flex-start',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 13,
    color: '#333',
  },
  menuIcon: {
    marginLeft: 'auto',
    padding: 6,
  },
});
