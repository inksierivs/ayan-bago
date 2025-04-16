import { db, logoutUser } from './firebase-auth.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Handle logout
document.getElementById("logoutButton").addEventListener("click", logoutUser);

// 🔍 Helper to get query parameters
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 🔥 Load class data
async function loadClassData() {
  const classId = getQueryParam("id");

  if (!classId) {
    alert("Class ID not found in URL.");
    return;
  }

  try {
    const classDocRef = doc(db, "classes", classId);
    const classDocSnap = await getDoc(classDocRef);

    if (!classDocSnap.exists()) {
      alert("Class not found.");
      return;
    }

    const classData = classDocSnap.data();

    // 🖼 Update the DOM with class data
    document.getElementById("classCode").textContent = classData.classCode;
    document.getElementById("subjectName").textContent = classData.subjectName;
    document.getElementById("schedule").textContent = classData.schedule;
    document.getElementById("classHeader").textContent = `${classData.program} : ${classData.year} - ${classData.block}`;


    // You can also dynamically load students/attendance here later

  } catch (err) {
    console.error("Error fetching class data:", err);
    alert("Failed to load class data.");
  }
}

// 📦 On page load
window.addEventListener("DOMContentLoaded", loadClassData);
