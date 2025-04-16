import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKCPHRHBeM2SjfESk3RDHFWdpFhEllrOY",
  authDomain: "wya-gc.firebaseapp.com",
  projectId: "wya-gc",
  storageBucket: "wya-gc.firebasestorage.app",
  messagingSenderId: "326895130760",
  appId: "1:326895130760:web:e7da3fa44c5a2f4467e73d",
  measurementId: "G-4R9KV6799T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const GOOGLE_DRIVE_CLIENT_ID = "80160515542-jhqpn34470pcuce5r6ohnvr74d06tcmv.apps.googleusercontent.com";
console.log("Google Drive Client ID:", GOOGLE_DRIVE_CLIENT_ID);

// Function to sign up new users
async function signupUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("password-confirm").value;
  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();

  if (password !== passwordConfirm) {
    alert("Passwords do not match!");
    return;
  }

  if (!email.endsWith("@gordoncollege.edu.ph")) {
    alert("You must use a @gordoncollege.edu.ph domain email to sign up.");
    return;
  }

  let role = "student";
  const localPart = email.split("@")[0];
  if (isNaN(localPart)) {
    role = "teacher";
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email,
      firstName: fname,
      lastName: lname,
      role
    });

    alert("Signup successful!");
    window.location.href = "login.html";
  } catch (err) {
    alert("Signup error: " + err.message);
  }
}

// Function to log in users
async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();

      const sessionUser = {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        program: userData.program || "update profile",
        year: userData.year || "update profile",
        block: userData.block || "update profile"
      };

      sessionStorage.setItem("user", JSON.stringify(sessionUser));

      if (userData.role === "teacher") {
        window.location.href = "dashboard.html";
      } else if (userData.role === "student") {
        window.location.href = "dashboard copy.html";
      } else {
        alert("Unknown user role.");
      }
    } else {
      alert("User profile not found in Firestore.");
    }

  } catch (err) {
    alert("Login error: " + err.message);
  }
}

// Logout function
function logoutUser() {
  signOut(auth).then(() => {
    sessionStorage.clear();
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
}

export { signupUser, loginUser, logoutUser, db, auth, app };
