import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          We value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.text}>
          We may collect information like your name, email, profile picture, and activity within the app. This data helps us improve user experience.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
        <Text style={styles.text}>
          Your data may be used to personalize your experience, send notifications, and enhance app functionality. We do not sell your data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.text}>
          We implement strict security measures to protect your data. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.text}>
          We may use third-party tools (like Firebase) to store and manage data. These services follow their own privacy policies.
        </Text>

        <Text style={styles.sectionTitle}>6. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this policy from time to time. Users will be notified about significant changes through the app or email.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions about this Privacy Policy, feel free to contact us at support@example.com.
        </Text>
      </ScrollView>
    </>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00c26f',
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
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#222',
  },
  text: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
});
