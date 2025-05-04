// service/postService.js
import { collection, where, getDocs, getDoc, doc, query, orderBy, limit as limitDocs } from "firebase/firestore";
import { db } from "../config/FirebaseConfig"; // adjust path if needed

// Fetch Posts by User
export const getPostsByUser = async (userId) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const fetchPost = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limitDocs(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const posts = [];

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: posts };
  } catch (error) {
    console.log("fetchPost error: ", error);
    return { success: false, message: "Could not fetch the posts." };
  }
};

export const fetchSinglePost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      return { success: true, data: { id: postSnap.id, ...postSnap.data() } };
    } else {
      return { success: false, message: 'Post not found' };
    }
  } catch (error) {
    console.error('Fetch single post error:', error);
    return { success: false, message: 'Error fetching post' };
  }
};


