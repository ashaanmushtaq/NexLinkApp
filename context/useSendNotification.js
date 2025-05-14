import { db } from '../config/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const useSendNotification = () => {
  const sendNotification = async (toUserId, message, postId, senderName, caption, fromUserId) => {
    try {
      // Prepare the notification message
      const notificationMessage = `${senderName} ${message}${caption ? `: "${caption}"` : ''}`;

      // Add the notification to Firestore
      await addDoc(collection(db, 'notifications'), {
        toUserId,
        message: notificationMessage,
        postId: postId || '',
        senderName,
        caption: caption || '',
        fromUserId, // ✅ Correct usage
        type: 'message', // optional but recommended
        createdAt: serverTimestamp(),
      });

      console.log('✅ Notification sent:', {
        toUserId,
        message: notificationMessage,
        postId,
        senderName,
        caption,
        fromUserId,
      });
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  };

  return sendNotification;
};

export default useSendNotification;
