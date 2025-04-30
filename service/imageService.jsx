import * as FileSystem from 'expo-file-system';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/FirebaseConfig'; // Adjust path based on your project

export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    return { uri: imagePath };
  } else {
    return require('../assets/images/defaultUser.png');
  }
};

export const getFilePath = (folderName, isImage) => {
  return `${folderName}/${Date.now()}.${isImage ? 'png' : 'mp4'}`;
};

export const uploadFile = async (folderName, fileUrl, isImage = true) => {
  try {
    const fileName = getFilePath(folderName, isImage);

    // Read file as binary
    const fileContent = await FileSystem.readAsStringAsync(fileUrl, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob
    const blob = await base64ToBlob(fileContent, isImage ? 'image/png' : 'video/mp4');

    // Create a Firebase storage ref
    const fileRef = ref(storage, fileName);

    // Upload blob to Firebase Storage
    await uploadBytes(fileRef, blob);

    // Get public download URL
    const downloadURL = await getDownloadURL(fileRef);

    return { success: true, url: downloadURL };

  } catch (error) {
    console.log('file upload error', error);
    return { success: false, message: "Could not upload media" };
  }
};

// Helper to convert base64 string to Blob
const base64ToBlob = async (base64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};
