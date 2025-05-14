// registerForPushNotifications.js

import * as Notifications from 'expo-notifications';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/FirebaseConfig';  // Adjust path if necessary

export const registerForPushNotifications = async () => {
  // Step 1: Get current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Step 2: Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Step 3: If permission not granted, show an alert
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  // Step 4: Get Expo push token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo Push Token:", token);
  

  // Step 5: Save the push token to Firebase Firestore if the user is authenticated
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      // Save the Expo push token under the user's document in Firestore
      await setDoc(
        doc(db, 'users', userId),
        { expoPushToken: token },  // Add the token to the user's Firestore document
        { merge: true }  // Don't overwrite other data in the user's document
      );
      console.log('Push token saved to Firestore');
    } catch (error) {
      console.error('Error saving push token to Firestore:', error);
    }
  }
};
