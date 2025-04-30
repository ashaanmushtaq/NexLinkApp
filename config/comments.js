import { db } from './FirebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  getCountFromServer
} from 'firebase/firestore';

// Add Comment
export const postComment = async (postId, userId, userName, text) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    await addDoc(commentsRef, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
};

// Get Comments
export const getComments = async (postId) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Delete Comment
export const deleteComment = async (postId, commentId) => {
  try {
    const commentDocRef = doc(db, 'posts', postId, 'comments', commentId);
    await deleteDoc(commentDocRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Get Comment Count
export const getCommentsCount = async (postId) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const snapshot = await getCountFromServer(commentsRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error fetching comments count:', error);
    return 0;
  }
};
