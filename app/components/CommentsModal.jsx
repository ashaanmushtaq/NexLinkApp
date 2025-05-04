import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, TouchableWithoutFeedback, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Avatar from './Avatar'; // same as in PostCard
import { getComments, postComment, deleteComment } from '../../config/comments';
import useSendNotification from '../../context/useSendNotification';

dayjs.extend(relativeTime);

const CommentsModal = ({ visible, onClose, postId, user, onCommentPosted, onCommentCountChanged }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const sendNotification = useSendNotification();

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);

      // Pass the comment count to the parent
      if (onCommentCountChanged) {
        onCommentCountChanged(data.length);
      }
    } catch (error) {
      console.log('Error loading comments:', error);
    }
  };

  const handlePostComment = async () => {
    if (!user?.uid) {
      console.log('User not logged in');
      return;
    }
  
    if (newComment.trim()) {
      try {
        // Ensure correct parameters are passed to postComment function
        await postComment(postId, user.uid, user.displayName, newComment.trim(), user.photoURL);

        // Clear input after posting
        setNewComment('');
  
        // Reload comments to update UI
        await loadComments();
  
        // Call the callback function to notify parent component
        if (onCommentPosted) {
          onCommentPosted();
        }
  
        // Send notification only if the comment is not by the post owner
        // if (post.userId !== authUser.uid) {
        //   await sendNotification(toUserId, 'comment your post', postId, senderName, post.caption);
        // }
      } catch (error) {
        console.log('Error posting comment:', error); // Debug log
      }
    } else {
      console.log('Comment is empty');
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteComment(postId, commentId);
              await loadComments();
            } catch (error) {
              console.log('Error deleting comment:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const commentTime = item.createdAt
      ? dayjs(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).fromNow()
      : '';

    return (
      <View style={styles.commentItem}>
        <Avatar uri={item.userPhotoURL} size={36} rounded={18} />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUser}>{item.userName}</Text>
            <Text style={styles.commentTime}>{commentTime}</Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
        {user?.uid === item.userId && (
          <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.commentsBox}
            >
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.commentsList}
                contentContainerStyle={{ paddingBottom: 10 }}
              />
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  style={styles.input}
                  onFocus={() => {}}
                />
                <TouchableOpacity onPress={handlePostComment} style={styles.postBtn}>
                  <Text style={styles.postBtnText}>Post</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  commentsBox: {
    backgroundColor: '#ffffff',
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  commentsList: {
    flexGrow: 0,
    marginBottom: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    position: 'relative',
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    fontSize: 14,
    color: '#333',
  },
  postBtn: {
    marginLeft: 10,
    backgroundColor: '#00c26f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 4,
    marginLeft: 5,
  },
});
