import { getDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

// Check if authUser is following targetUser
export const isFollowing = async (authUserId, targetUserId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', authUserId));
    if (userDoc.exists()) {
      const following = userDoc.data().following || [];
      return following.includes(targetUserId);
    }
    return false;
  } catch (error) {
    console.log('Follow status fetch error:', error);
    return false;
  }
};

// Follow user
export const followUser = async (authUserId, targetUserId) => {
  try {
    await updateDoc(doc(db, 'users', authUserId), {
      following: arrayUnion(targetUserId),
    });
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayUnion(authUserId),
    });
  } catch (error) {
    console.error('Error following user:', error);
  }
};

// Unfollow user
export const unfollowUser = async (authUserId, targetUserId) => {
  try {
    await updateDoc(doc(db, 'users', authUserId), {
      following: arrayRemove(targetUserId),
    });
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayRemove(authUserId),
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
  }
};
