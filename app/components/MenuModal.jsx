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
        await unfollowUser(authUser.uid, post.userId);
        onUnfollow?.(post.userId);

        const currentUserRef = doc(db, 'users', authUser.uid);
        const senderSnap = await getDoc(currentUserRef);
        const senderName = senderSnap.exists() ? senderSnap.data().displayName : 'Someone';

        await sendNotification(
          post.userId,
          'stopped following you',
          '',
          senderName,
          ''
        );
      } else {
        await followUser(authUser.uid, post.userId);

        const currentUserRef = doc(db, 'users', authUser.uid);
        const senderSnap = await getDoc(currentUserRef);
        const senderName = senderSnap.exists() ? senderSnap.data().displayName : 'Someone';

        await sendNotification(
          post.userId,
          'started following you',
          '',
          senderName,
          ''
        );
      }
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.log('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (label, onPress, iconName, options = {}) => {
    const { destructive = false, cancel = false } = options;
    return (
      <TouchableOpacity
        style={[
          styles.option,
          destructive && styles.destructive,
          cancel && styles.cancelButton,
        ]}
        onPress={onPress}
        disabled={loading}
      >
        <AntDesign
          name={iconName}
          size={22}
          color={
            destructive
              ? '#f44336'
              : cancel
              ? '#888'
              : '#3a3a3a'
          }
          style={styles.icon}
        />
        <Text
          style={[
            styles.optionText,
            destructive && styles.destructiveText,
            cancel && styles.cancelText,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          {renderOption(
            'View Profile',
            () => {
              onClose();
              onViewProfile(post?.userId);
            },
            'user'
          )}

          {!isOwnPost &&
            renderOption(
              loading ? 'Please wait...' : isFollowing ? 'Unfollow' : 'Follow',
              toggleFollow,
              isFollowing ? 'deleteuser' : 'adduser'
            )}

          {isOwnPost &&
            renderOption(
              'Delete Post',
              () => {
                onClose();
                onDelete(post?.id);
              },
              'delete',
              { destructive: true }
            )}

          {renderOption(
            'Hide Post',
            () => {
              onClose();
              onHide(post?.id);
            },
            'eyeo'
          )}

          {renderOption('Cancel', onClose, 'close', { cancel: true })}
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
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelText: {
    color: '#888',
    fontWeight: '600',
  },
  icon: {
    marginLeft: 4,
  },
});
