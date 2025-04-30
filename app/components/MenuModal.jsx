import React from 'react';
import { Modal, View, TouchableOpacity, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';

const MenuModal = ({ visible, onClose, onViewProfile, onUnfollow, onDelete, onHide }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuBox}>
            <TouchableOpacity onPress={onViewProfile}>
              <Text style={styles.menuItem}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onUnfollow}>
              <Text style={styles.menuItem}>Unfollow</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Text style={styles.menuItem}>Delete Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onHide}>
              <Text style={styles.menuItem}>Hide Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MenuModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
});
