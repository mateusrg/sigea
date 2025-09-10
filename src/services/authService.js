import { auth, db } from './firebase';

export async function login(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    const token = await userCredential.user.getIdToken();
    const profileDoc = await db.collection('users').doc(uid).get();
    const profile = profileDoc.data();
    return { uid, profile, token };
  } catch (error) {
    throw error;
  }
}

export function logout() {
  return auth.signOut();
}
