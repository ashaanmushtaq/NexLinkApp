import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { db, auth } from '../../config/FirebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Avatar from '../components/Avatar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleNotificationPress = (item) => {
    if (item?.postId) {
      router.push(`/post/${item.postId}`);
    }
  };
  

  const renderItem = ({ item }) => {
    console.log(item); // This will now have 'message'
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <View style={styles.notificationCard}>
          <Avatar uri={item.senderImage || null} size={42} />
          <View style={styles.messageContainer}>
            <Text style={styles.senderName}>{item.senderName || 'Unknown'}</Text>
            <Text style={styles.message}>{item.message}</Text> {/* Displaying the message here */}
            <Text style={styles.time}>
              {item.createdAt?.toDate?.().toLocaleString?.() || ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  


  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
        />
      )}
    </>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
  },
  messageContainer: {
    marginLeft: 12,
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
  },
  message: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});
