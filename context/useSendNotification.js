import { db } from '../config/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
