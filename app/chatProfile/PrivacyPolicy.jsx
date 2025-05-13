import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} /> {/* Placeholder to center title */}
      </View>

      {/* Scrollable content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Privacy Matters</Text>
        <Text style={styles.paragraph}>
          We value your trust. This Privacy Policy explains how we collect, use, and share your information.
        </Text>

        <Text style={styles.sectionTitle}>1. Data Usage</Text>
        <Text style={styles.paragraph}>
          We use your data to improve our services, personalize content, and enhance user experience. Your data is not sold to third parties.
        </Text>

        <Text style={styles.sectionTitle}>2. User Rights</Text>
        <Text style={styles.paragraph}>
          You can access, modify, or delete your data at any time from your profile settings or by contacting support.
        </Text>

        <Text style={styles.sectionTitle}>3. Storage & Retention</Text>
        <Text style={styles.paragraph}>
          Your data is securely stored and retained only as long as necessary to provide our services or comply with legal requirements.
        </Text>

        <Text style={styles.sectionTitle}>4. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or concerns, please email us at <Text style={styles.link}>privacy@yourapp.com</Text>.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  link: {
    color: '#1e90ff',
  },
});
