import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from './firebase-auth.js';

const video = document.getElementById('camera');
const canvas = document.getElementById('snapshotCanvas');

// Get student name from sessionStorage
const studentInfo = JSON.parse(sessionStorage.getItem("studentName"));
const studentID = new URLSearchParams(window.location.search).get("studentID");

const fullName = studentInfo
  ? ${studentInfo.firstName}_${studentInfo.lastName}.replace(/\s+/g, "_")
  : student_${studentID};

const cloudName = "dxkcitpt9";
const uploadPreset = "student_selfies";

const constraints = {
  video: {
    facingMode: "user",
    width: { ideal: 640 },
    height: { ideal: 480 }
  },
  audio: false
};

// Start camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    await new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    console.log("✅ Camera started");

    const loading = document.getElementById("cameraLoading");
    if (loading) loading.style.display = "none";

  } catch (err) {
    console.error("❌ Camera access error:", err);
    alert("❌ Camera access denied.");
  }
}

// Capture and upload selfie
async function captureSelfie() {
  console.log("📸 Preparing to capture...");

  await new Promise(resolve => setTimeout(resolve, 300)); // delay

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const testData = canvas.toDataURL("image/jpeg");
  if (!testData || testData.length < 1000) {
    alert("❌ Failed to capture image. Please try again.");
    return;
  }

  const blob = await (await fetch(testData)).blob();

  // ✅ formData declared here
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", uploadPreset);
  formData.append("public_id", selfie_${fullName}_${studentID});

  try {
    const response = await fetch(https://api.cloudinary.com/v1_1/${cloudName}/image/upload, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.secure_url) {
      console.error("❌ Cloudinary upload failed:", result);
      alert("❌ Upload failed: " + (result.error?.message || "Unknown error"));
      return;
    }

    const selfieUrl = result.secure_url;
    console.log("✅ Cloudinary URL:", selfieUrl);
    alert("✅ Selfie uploaded!\nURL: " + selfieUrl);

    // 🔁 Save selfie URL to Firestore
    try {
      const userRef = doc(db, "users", studentID);
      console.log("📄 Attempting set/merge at users/" + studentID);

      await setDoc(userRef, { selfieUrl }, { merge: true });

      console.log("✅ Firestore saved with selfie URL");
      alert("📸 Selfie URL saved to Firestore!");
    } catch (firestoreError) {
      console.error("❌ Firestore save error:", firestoreError);
      alert("❌ Firestore save failed: " + firestoreError.message);
    }

  } catch (uploadError) {
    console.error("❌ Upload to Cloudinary failed:", uploadError);
    alert("❌ Upload to Cloudinary failed: " + uploadError.message);
  }
}

window.onload = startCamera;
window.captureSelfie = captureSelfie;  
