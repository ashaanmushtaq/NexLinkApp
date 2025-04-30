import { db } from './FirebaseConfig'; // ✅ correct firebase import
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

// Follow a user
export const followUser = async (currentUserId, targetUserId) => {
  const followingRef = collection(db, 'users', currentUserId, 'following');
  const followersRef = collection(db, 'users', targetUserId, 'followers');

  // Add in current user's following collection
  await addDoc(followingRef, { userId: targetUserId });

  // Add in target user's followers collection
  await addDoc(followersRef, { userId: currentUserId });
};

// Unfollow a user
export const unfollowUser = async (currentUserId, targetUserId) => {
  const followingRef = collection(db, 'users', currentUserId, 'following');
  const followersRef = collection(db, 'users', targetUserId, 'followers');

  // Remove from following collection
  const followingSnapshot = await getDocs(followingRef);
  followingSnapshot.forEach(async (docu) => {
    if (docu.data().userId === targetUserId) {
      await deleteDoc(docu.ref);
    }
  });

  // Remove from followers collection
  const followersSnapshot = await getDocs(followersRef);
  followersSnapshot.forEach(async (docu) => {
    if (docu.data().userId === currentUserId) {
      await deleteDoc(docu.ref);
    }
  });
};

// Check if current user is following a target user
export const isFollowing = async (currentUserId, targetUserId) => {
  const followingRef = collection(db, 'users', currentUserId, 'following');
  const querySnapshot = await getDocs(followingRef);
  return querySnapshot.docs.some(doc => doc.data().userId === targetUserId);
};

// Get number of followers for a user
export const getFollowersCount = async (targetUserId) => {
  const followersRef = collection(db, 'users', targetUserId, 'followers');
  const querySnapshot = await getDocs(followersRef);
  return querySnapshot.size;
};

// Get number of following for a user
export const getFollowingCount = async (currentUserId) => {
  const followingRef = collection(db, 'users', currentUserId, 'following');
  const querySnapshot = await getDocs(followingRef);
  return querySnapshot.size;
};
