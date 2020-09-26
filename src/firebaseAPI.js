import * as firebase from "firebase";

const config = {
  apiKey: "AIzaSyADu9CWQ78aswvnNtVhxK-W-T9av4g2jt0",
  authDomain: "hippo-chat-17580.firebaseapp.com",
  databaseURL: "https://hippo-chat-17580.firebaseio.com",
  projectId: "hippo-chat-17580",
  storageBucket: "hippo-chat-17580.appspot.com",
  messagingSenderId: "285407145365",
  appId: "1:285407145365:web:97f559eb273b6d11241a9c",
  measurementId: "G-2WWKLLKNC4"
};

firebase.initializeApp(config);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();




