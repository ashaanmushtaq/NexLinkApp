import { db } from '../config/FirebaseConfig';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const useSendNotification = () => {
  const sendNotification = async (toUserId, message, postId, senderName, caption) => {
    try {
      // Prepare the notification message
      const notificationMessage = `${senderName} ${message}: "${caption}"`; 

      // Adding notification to Firestore
      await addDoc(collection(db, 'notifications'), {
        toUserId,
        message: notificationMessage,
        postId,
        senderName,
        caption,
        createdAt: serverTimestamp(), // Use serverTimestamp for accurate timestamp
      });

      console.log("✅ Notification sent:", {
        toUserId,
        message,
        postId,
        senderName,
        caption,
      });
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  };

  return sendNotification;
};

export default useSendNotification;

// useSendNotification.js

export const sendNotification = async ({ recipientId, title, body }) => {
  // Example using Expo push notifications (you should adapt this to your backend or logic)
  const userDoc = await getDoc(doc(db, 'users', recipientId));
  const expoPushToken = userDoc.data()?.expoPushToken;

  if (!expoPushToken) throw new Error('No push token for user');

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { someData: 'optional' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};
