import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/FirebaseConfig'; // adjust path

const timerOptions = [
  { label: 'Off', value: null },
  { label: "Once they're seen", value: 'seen' },
  { label: '24 hours', value: 86400 },
  { label: '7 days', value: 604800 },
];

export default function SetDisappearingMessages() {
  const router = useRouter();
  const { userId } = useLocalSearchParams(); // receiver ID
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = 'CURRENT_USER_ID'; // replace this with your auth.currentUser.uid

  const chatId =
    currentUserId > userId
      ? `${currentUserId}_${userId}`
      : `${userId}_${currentUserId}`;

  useEffect(() => {
    const fetchTimerSetting = async () => {
      const docRef = doc(db, 'chats', chatId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelected(docSnap.data()?.disappearing || null);
      }
      setLoading(false);
    };
    fetchTimerSetting();
  }, []);

  const handleSelect = async (value) => {
    try {
      await setDoc(
        doc(db, 'chats', chatId),
        { disappearing: value },
        { merge: true }
      );
      setSelected(value);
      Alert.alert('Updated', 'Disappearing setting updated successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Disappearing Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Options */}
      {timerOptions.map((option, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.option}
          onPress={() => handleSelect(option.value)}
        >
          <Text style={styles.optionText}>{option.label}</Text>
          {selected === option.value && (
            <Ionicons name="checkmark" size={20} color="#3897f0" />
          )}
        </TouchableOpacity>
      ))}

      {/* Info Text */}
      <Text style={styles.note}>
        Messages will automatically disappear based on your selected time. This setting applies to both sides of the chat.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  optionText: { fontSize: 16 },
  note: {
    padding: 20,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
