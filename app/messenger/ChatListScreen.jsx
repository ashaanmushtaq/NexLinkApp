import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/FirebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ChatListScreen = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    const fetchFollowedUsersWithChats = async () => {
      const currentUserRef = doc(db, 'users', currentUserId);
      const currentUserSnap = await getDoc(currentUserRef);
      const currentUserData = currentUserSnap.data();
      const followedUserIds = currentUserData?.following || [];

      const conversationsMap = {};

      const q = query(
        collection(db, 'conversations'),
        where('members', 'array-contains', currentUserId),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const otherUserId = data.members.find((id) => id !== currentUserId);
          conversationsMap[otherUserId] = {
            id: docSnap.id,
            lastMessage: data.lastMessage || '',
            updatedAt: data.updatedAt?.toDate() || new Date(),
            unread: data.unread?.[currentUserId] || false,
          };
        });

        const fetchedConversations = await Promise.all(
          followedUserIds.map(async (userId) => {
            const userDocRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userDocRef);
            const userData = userSnap.exists() ? userSnap.data() : { displayName: 'Unknown' };

            const convo = conversationsMap[userId];

            return {
              id: convo?.id || null,
              userId,
              user: userData,
              lastMessage: convo?.lastMessage || '',
              updatedAt: convo?.updatedAt || new Date(0),
              unread: convo?.unread || false,
            };
          })
        );

        fetchedConversations.sort((a, b) => b.updatedAt - a.updatedAt);
        setConversations(fetchedConversations);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsub = fetchFollowedUsersWithChats();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [currentUserId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00c26f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/messenger/${item.userId}`)}
          >
            {item.user.photoURL ? (
              <Image source={{ uri: item.user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.user.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.textContainer}>
              <View style={styles.row}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {item.user.displayName || 'Unknown'}
                </Text>
                <Text style={styles.timeText}>
                  {item.updatedAt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text
                style={[
                  styles.lastMessage,
                  item.unread && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage || 'No messages yet'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations found.</Text>
        }
      />
    </View>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.6,
    borderBottomColor: '#ececec',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
