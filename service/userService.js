import { firestore } from '../config/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const searchUsers = async (queryText) => {
  const usersCollection = collection(firestore, 'users');
  const q = query(usersCollection, where('name', '>=', queryText), where('name', '<=', queryText + '\uf8ff'));
  
  try {
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};
