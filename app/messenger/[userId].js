import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { auth, db } from '../../config/FirebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import moment from 'moment';
import { sendNotification } from '../../context/useSendNotification';

const ChatScreen = () => {
  const { userId: receiverId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState('');
  const [receiverData, setReceiverData] = useState(null);
  const [senderData, setSenderData] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);

  const senderId = auth.currentUser?.uid;
  const flatListRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const fetchSenderData = async () => {
      if (!senderId) return;
      const userSnap = await getDoc(doc(db, 'users', senderId));
      if (userSnap.exists()) setSenderData(userSnap.data());
    };
    fetchSenderData();
  }, [senderId]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', receiverId), (snap) => {
      if (snap.exists()) {
        setReceiverData(snap.data());
        setLastSeen(snap.data().lastSeen?.toDate?.());
      }
    });
    return unsub;
  }, [receiverId]);

  useEffect(() => {
    if (!senderId || !receiverId) return;
    const getOrCreateChat = async () => {
      const chatsRef = collection(db, 'conversations');
      const q = query(
        chatsRef,
        where('members', 'in', [
          [senderId, receiverId],
          [receiverId, senderId],
        ])
      );
      const chatSnap = await getDocs(q);

      if (!chatSnap.empty) {
        const chatDoc = chatSnap.docs[0];
        setChatId(chatDoc.id);
        listenForMessages(chatDoc.id);
      } else {
        const newChatRef = doc(chatsRef);
        await setDoc(newChatRef, {
          members: [senderId, receiverId],
          lastMessage: '',
          updatedAt: serverTimestamp(),
          unread: {
            [senderId]: false,
            [receiverId]: true,
          },
        });
        setChatId(newChatRef.id);
        listenForMessages(newChatRef.id);
      }
    };
    getOrCreateChat();
  }, [senderId, receiverId]);

  const listenForMessages = (chatId) => {
    const msgRef = collection(db, 'conversations', chatId, 'messages');
    const q = query(msgRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });
  };

  useEffect(() => {
    if (!senderId) return;
    const userRef = doc(db, 'users', senderId);
    updateDoc(userRef, {
      lastSeen: serverTimestamp(),
    });
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !chatId) return;

    const msgRef = collection(db, 'conversations', chatId, 'messages');
    await addDoc(msgRef, {
      text: message.trim(),
      senderId,
      receiverId,
      senderPhoto: senderData?.photoURL || '',
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'conversations', chatId), {
      lastMessage: message.trim(),
      updatedAt: serverTimestamp(),
      [`unread.${receiverId}`]: true,
      [`unread.${senderId}`]: false,
    });

    try {
      await sendNotification({
        recipientId: receiverId,
        title: 'New Message',
        body: `You have a new message from ${senderData?.displayName}`,
      });
      console.log('✅ Notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }

    setMessage('');
  };

  const renderItem = ({ item, index }) => {
    const isMe = item.senderId === senderId;
    const isLast = isMe && index === messages.length - 1;
    const formattedTime = item.createdAt?.toDate
      ? moment(item.createdAt.toDate()).format('hh:mm A')
      : '';

    const seenStatus =
      isLast && lastSeen && item.createdAt?.toDate?.() <= lastSeen
        ? 'Seen'
        : isLast
        ? 'Unseen'
        : null;

    return (
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
        ]}
      >
        {!isMe && item.senderPhoto && (
          <Image source={{ uri: item.senderPhoto }} style={styles.avatar} />
        )}

        <View>
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>

          <Text
            style={[
              styles.timeText,
              { alignSelf: isMe ? 'flex-end' : 'flex-start' },
            ]}
          >
            {formattedTime}
          </Text>

          {seenStatus && (
            <Text
              style={
                seenStatus === 'Seen'
                  ? styles.seenTextSeen
                  : styles.seenTextUnseen
              }
            >
              {seenStatus}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() =>
            router.push({
              pathname: `/chatProfile/${receiverId}`,
              params: { userId: receiverId },
            })
          }
        >
          {receiverData?.photoURL ? (
            <Image source={{ uri: receiverData.photoURL }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle" size={35} color="#999" />
          )}
          <Text style={styles.username}>{receiverData?.displayName || 'Unknown'}</Text>
        </TouchableOpacity>
        <View style={styles.callIcons}>
          <TouchableOpacity style={styles.iconSpacing}>
            <Ionicons name="call" size={22} color="#00c26f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconSpacing}>
            <Ionicons name="videocam" size={22} color="#00c26f" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaIcon}>
          <Feather name="camera" size={22} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaIcon}>
          <Feather name="image" size={22} color="#555" />
        </TouchableOpacity>
        <TextInput
          placeholder="Message..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

// Your styles remain unchanged from what you provided.

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  profileImage: { width: 35, height: 35, borderRadius: 20, marginRight: 8 },
  username: { fontSize: 16, fontWeight: '600' },
  callIcons: { flexDirection: 'row', marginLeft: 'auto' },
  iconSpacing: { marginLeft: 15 },
  messagesContainer: { paddingVertical: 10, paddingHorizontal: 12 },
  messageWrapper: { marginVertical: 6, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end', flexDirection: 'row-reverse' },
  theirMessageWrapper: { alignSelf: 'flex-start', justifyContent: 'flex-start' },
  messageBubble: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  myMessage: { backgroundColor: '#00c26f', borderBottomRightRadius: 2 },
  theirMessage: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 15, color: '#000' },
  timeText: { fontSize: 11, color: '#aaa', marginTop: 4, marginHorizontal: 8, fontStyle: 'italic' },
  seenText: { fontSize: 10, color: '#00c26f', alignSelf: 'flex-end', marginRight: 8, marginTop: 2 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 6 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
  mediaIcon: { marginHorizontal: 6 },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    fontSize: 15,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#00c26f',
    borderRadius: 20,
    padding: 10,
    marginLeft: 4,
  },
  seenTextSeen: {
    fontSize: 11,
    color: '#00c26f', // Green color for 'Seen'
    marginTop: 2,
    textAlign: 'right',
  },
  seenTextUnseen: {
    fontSize: 11,
    color: '#888', // Gray color for 'Unseen'
    marginTop: 2,
    textAlign: 'right',
  },
  
});
