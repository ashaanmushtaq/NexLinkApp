import { db } from '../config/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const sendNotification = async (targetUserId, type, postId, senderName) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid === targetUserId) return;

  try {
    const notification = {
      toUserId: targetUserId,           // Target user (receiver)
      fromUserId: currentUser.uid,      // Sender (current user)
      senderName: senderName || currentUser.displayName || 'Unknown',  // Sender's name, fallback to 'Unknown' if not provided
      senderImage: currentUser.photoURL || '',  // Sender's photo URL (if available)
      type,                             // Type of notification (like, comment, follow, etc.)
      postId: postId || null,           // Post ID related to the notification (optional)
      isRead: false,                    // Notification status (unread initially)
      createdAt: serverTimestamp(),     // Timestamp when the notification is created
    };

    // Add the notification to Firestore
    await addDoc(collection(db, 'notifications'), notification);
    console.log('Notification sent');
  } catch (error) {
    console.error('Error sending notification:', error);  // Handle any errors
  }
};
