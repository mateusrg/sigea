// src/services/authService.js
import { auth, db } from './firebase';

// Login with email and password
export async function login(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    // Fetch user profile (role) from Firestore
    const profileDoc = await db.collection('users').doc(uid).get();
    console.log(profileDoc);
const profile = profileDoc.exists ? profileDoc.data().nome : null;
    console.log(profile);
    return { uid, profile };
  } catch (error) {
    throw error;
  }
}

// Logout
export function logout() {
  return auth.signOut();
}
