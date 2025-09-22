import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdaEU1ZLMlY8tw6J-OwSc5g-AoTWusrFU",
  authDomain: "sigea-4f858.firebaseapp.com",
  projectId: "sigea-4f858",
  storageBucket: "sigea-4f858.firebasestorage.app",
  messagingSenderId: "63629689136",
  appId: "1:63629689136:web:31456d77343ba03d09c8f5"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;