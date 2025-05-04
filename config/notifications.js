import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const sendNotification = async ({
  userId,
  senderId,
  senderName,
  senderImage,
  postId,
  type,
}) => {
  const message =
    type === 'like'
      ? `${senderName} liked your post`
      : `${senderName} commented on your post`;

  await addDoc(collection(db, 'notifications'), {
    userId,
    senderId,
    senderName,
    senderImage,
    type,
    postId,
    message,
    createdAt: serverTimestamp(),
  });
};
