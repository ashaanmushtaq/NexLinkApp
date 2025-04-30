import { db } from './FirebaseConfig'; // Your Firebase config
import { getDocs, collection, query, where } from 'firebase/firestore';

// Function to search users by their username
export const searchUsers = async (searchText) => {
  try {
    const usersCollection = collection(db, 'users'); // Assuming 'users' is the name of your Firestore collection
    const q = query(usersCollection, where('username', '>=', searchText)); // Partial matching
    const querySnapshot = await getDocs(q);
    
    let users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data()); // Add each user to the array
    });

    return users;
  } catch (error) {
    console.error('Error searching users in Firebase:', error);
    throw new Error('Error searching users');
  }
};
