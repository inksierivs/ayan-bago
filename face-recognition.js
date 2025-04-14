import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from './public/js/firebase-auth.js';

// ✅ Import face-api properly as a module
import * as faceapi from 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.esm.js';

const video = document.getElementById('camera');
const canvas = document.getElementById('snapshotCanvas');
const captureBtn = document.getElementById('captureBtn');

const studentID = new URLSearchParams(window.location.search).get("studentID");
const studentInfo = JSON.parse(sessionStorage.getItem("studentName"));
const fullName = studentInfo
  ? `${studentInfo.firstName}_${studentInfo.lastName}`.replace(/\s+/g, "_")
  : `student_${studentID}`;

const cloudName = "dxkcitpt9";
const uploadPreset = "student_selfies";

// Load face-api models
await Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models')
]);

// Start camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("❌ Camera access denied.");
    console.error(err);
  }
}

// Capture selfie to canvas
function captureToCanvas() {
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

// Upload selfie to Cloudinary
async function uploadSelfie() {
  const dataUrl = canvas.toDataURL("image/jpeg");
  const blob = await (await fetch(dataUrl)).blob();
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", uploadPreset);
  formData.append("public_id", `selfie_${fullName}_${studentID}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
  return result.secure_url;
}

// Save selfie URL to Firestore
async function saveSelfieToFirestore(url) {
  const userRef = doc(db, "users", studentID);
  await updateDoc(userRef, { selfieUrl: url });
}

// Capture and verify
captureBtn.addEventListener("click", async () => {
  captureToCanvas();

  const userRef = doc(db, "users", studentID);
  const userSnap = await getDoc(userRef);
  const selfieUrl = userSnap.exists() ? userSnap.data().selfieUrl : null;

  if (!selfieUrl) {
    // No selfie yet — upload
    const uploadedUrl = await uploadSelfie();
    await saveSelfieToFirestore(uploadedUrl);
    alert("✅ Selfie captured and saved. You may verify now.");
    return;
  }

  // Compare live with reference
  const referenceImage = await faceapi.fetchImage(selfieUrl);
  const referenceDescriptor = await faceapi
    .detectSingleFace(referenceImage, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  const liveResult = await faceapi
    .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!referenceDescriptor || !liveResult) {
    alert("❌ Face not detected properly.");
    return;
  }

  const distance = faceapi.euclideanDistance(
    referenceDescriptor.descriptor,
    liveResult.descriptor
  );

  if (distance < 0.5) {
    alert("✅ Face match confirmed!");
  } else {
    alert("❌ Face does not match.");
  }
});

startCamera();
