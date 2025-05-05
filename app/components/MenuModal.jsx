import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import {
  followUser,
  unfollowUser,
  isFollowingUser,
} from '../../service/followService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import useSendNotification from '../../context/useSendNotification';

const MenuModal = ({
  visible,
  onClose,
  post,
  authUser,
  onViewProfile,
  onUnfollow,
  onDelete,
  onHide,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const isOwnPost = post?.userId === authUser?.uid;
  const sendNotification = useSendNotification();

  useEffect(() => {
    let isMounted = true;

    const fetchFollowStatus = async () => {
      if (!isOwnPost && authUser?.uid && post?.userId) {
        try {
          const result = await isFollowingUser(authUser.uid, post.userId);
          if (isMounted) setIsFollowing(result);
        } catch (err) {
          console.log('Error fetching follow status:', err);
        }
      }
    };

    if (visible) {
      fetchFollowStatus();
    }

    return () => {
      isMounted = false;
      setIsFollowing(false);
    };
  }, [visible, authUser?.uid, post?.userId]);

  const toggleFollow = async () => {
    if (!authUser?.uid || !post?.userId) return;
    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow user
        await unfollowUser(authUser.uid, post.userId);
        onUnfollow?.(post.userId);
  
        // ✅ Send unfollow notification
        const currentUserRef = doc(db, 'users', authUser.uid);
        const senderSnap = await getDoc(currentUserRef);
        const senderName = senderSnap.exists() ? senderSnap.data().displayName : 'Someone';
  
        // Send unfollow notification
        await sendNotification(
          post.userId,
          'stopped following you',
          '', // No postId
          senderName,
          '' // No caption
        );
      } else {
        // Follow user
        await followUser(authUser.uid, post.userId);
  
        // ✅ Send follow notification
        const currentUserRef = doc(db, 'users', authUser.uid);
        const senderSnap = await getDoc(currentUserRef);
        const senderName = senderSnap.exists() ? senderSnap.data().displayName : 'Someone';
  
        // Send follow notification
        await sendNotification(
          post.userId,
          'started following you',
          '', // No postId
          senderName,
          '' // No caption
        );
      }
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.log('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  };
  

  const renderOption = (label, onPress, iconName, destructive = false) => (
    <TouchableOpacity
      style={[styles.option, destructive && styles.destructive]}
      onPress={onPress}
      disabled={loading}
    >
      <AntDesign
        name={iconName}
        size={22}
        color={destructive ? '#f44336' : '#3a3a3a'}
        style={styles.icon}
      />
      <Text style={[styles.optionText, destructive && styles.destructiveText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          {renderOption('View Profile', () => {
            onClose();
            onViewProfile(post?.userId);
          }, 'user')}

          {!isOwnPost &&
            renderOption(
              loading ? 'Please wait...' : isFollowing ? 'Unfollow' : 'Follow',
              toggleFollow,
              isFollowing ? 'deleteuser' : 'adduser'
            )}

          {isOwnPost &&
            renderOption('Delete Post', () => {
              onClose();
              onDelete(post?.id);
            }, 'delete', true)}

          {renderOption('Hide Post', () => {
            onClose();
            onHide(post?.id);
          }, 'eyeo')}

          {renderOption('Cancel', onClose, 'close')}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default MenuModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  option: {
    paddingVertical: 18,
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a3a3a',
    marginLeft: 12,
  },
  destructive: {
    backgroundColor: '#fff5f5',
  },
  destructiveText: {
    color: '#f44336',
    fontWeight: '700',
  },
  icon: {
    marginLeft: 4,
  },
});
