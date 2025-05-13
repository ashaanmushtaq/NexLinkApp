import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { auth, db } from '../../config/FirebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

const ChatScreen = ({ route }) => {
  const { conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const currentUserId = auth.currentUser.uid;

  useEffect(() => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');

    await addDoc(messagesRef, {
      text: inputText,
      senderId: currentUserId,
      timestamp: serverTimestamp(),
    });

    setInputText('');
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUserId;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp?.toDate()).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  chatContainer: {
    padding: 10,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: '#0084ff',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#e4e6eb',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    color: '#ccc',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#0084ff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
