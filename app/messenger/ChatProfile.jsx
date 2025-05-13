import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const UserDetailScreen = () => {
  const { userId } = useLocalSearchParams();

  // You can fetch full user profile using userId from Firestore here
  const mockUser = {
    name: 'Bella',
    image: 'https://i.pravatar.cc/300',
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: mockUser.image }} style={styles.profileImage} />
      <Text style={styles.username}>{mockUser.name}</Text>

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="person" size={24} color="#000" />
          <Text style={styles.iconLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="search" size={24} color="#000" />
          <Text style={styles.iconLabel}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="notifications-off" size={24} color="#000" />
          <Text style={styles.iconLabel}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
          <Text style={styles.iconLabel}>Options</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.rowItem}>
          <MaterialIcons name="block" size={22} color="red" />
          <Text style={styles.rowText}>Block User</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowItem}>
          <Feather name="alert-triangle" size={22} color="orange" />
          <Text style={styles.rowText}>Report User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.rowItem}>
          <Ionicons name="timer" size={22} color="#555" />
          <Text style={styles.rowText}>Disappearing Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowItem}>
          <Ionicons name="document-text" size={22} color="#555" />
          <Text style={styles.rowText}>Privacy & Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowItem}>
          <Ionicons name="images" size={22} color="#555" />
          <Text style={styles.rowText}>Shared Media</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UserDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginTop: 20,
  },
  iconBox: {
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  rowText: {
    marginLeft: 10,
    fontSize: 15,
  },
});
