// likes.js
import { db, auth } from './FirebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

export const sendNotification = async (receiverId, message) => {
  try {
    const sender = auth.currentUser;

    await addDoc(collection(db, 'notifications'), {
      userId: receiverId, // 💡 This is who will RECEIVE the notification
      senderId: sender.uid,
      senderImage: sender.photoURL || '',
      message: message,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const likePost = async (postId, userId) => {
  try {
    const likeRef = collection(db, 'posts', postId, 'likes');
    await addDoc(likeRef, { userId });
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId, userId) => {
  try {
    const likesRef = collection(db, 'posts', postId, 'likes');
    const q = query(likesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    for (const docu of snapshot.docs) {
      await deleteDoc(doc(db, 'posts', postId, 'likes', docu.id));
    }
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

export const isPostLiked = async (postId, userId) => {
  try {
    const likesRef = collection(db, 'posts', postId, 'likes');
    const q = query(likesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

export const getLikesCount = async (postId) => {
  try {
    const likesRef = collection(db, 'posts', postId, 'likes');
    const snapshot = await getDocs(likesRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting likes count:', error);
    return 0;
  }
};