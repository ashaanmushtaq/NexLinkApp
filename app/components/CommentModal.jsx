import React, { useState } from 'react';
import { Modal, View, TextInput, Button, StyleSheet } from 'react-native';
import { addComment } from '../../config/comments';

const CommentModal = ({ visible, onClose, postId, user }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = async () => {
    if (commentText.trim()) {
      await addComment(postId, user.uid, user.displayName, commentText);
      setCommentText('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Write a comment..."
            value={commentText}
            onChangeText={setCommentText}
            style={styles.input}
          />
          <Button title="Submit" onPress={handleSubmit} />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
  },
});

export default CommentModal;