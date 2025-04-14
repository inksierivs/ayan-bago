import { auth, db, logoutUser } from './firebase-auth.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const userSession = JSON.parse(sessionStorage.getItem("user"));
if (!userSession) {
  window.location.href = "login.html";
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
  
    clearTimeout(showToast.timeout); // Clear previous timeout if any
    showToast.timeout = setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
    }, 3000);
  }
  

document.getElementById('name').value = `${userSession.firstName || ''} ${userSession.lastName || ''}`.trim();
document.getElementById('email').value = userSession.email || '';

// Flag to track if alert was already shown
let alertShown = false;

async function loadTeacherProfile() {
  try {
    const userRef = doc(db, "users", userSession.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      const teacherIDInput = document.getElementById('teacherID');
      const facultyInput = document.getElementById('faculty');
      const instructorTypeInput = document.getElementById('instructorType');
      const contactInput = document.getElementById('contactNo');

      teacherIDInput.value = data.teacherID || '';
      facultyInput.value = data.faculty || '';
      instructorTypeInput.value = data.instructorType || '';
      contactInput.value = data.contactNumber || '';

      if (data.teacherID && data.teacherID.trim().length > 0) {
        teacherIDInput.disabled = true;
      } else {
        teacherIDInput.addEventListener("focus", showEditWarningOnce);
      }

      if (data.faculty && data.faculty.trim().length > 0) {
        facultyInput.disabled = true;
      } else {
        facultyInput.addEventListener("focus", showEditWarningOnce);
      }
    }
  } catch (error) {
    console.error("Error loading teacher profile:", error);
  }
}

function showEditWarningOnce() {
    if (!alertShown) {
      showToast();
      alertShown = true;
    }
  }
  


document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherIDInput = document.getElementById('teacherID');
  const facultyInput = document.getElementById('faculty');
  const instructorTypeInput = document.getElementById('instructorType');
  const contactInput = document.getElementById('contactNo');

  const updatedData = {
    instructorType: instructorTypeInput.value.trim(),
    contactNumber: contactInput.value.trim()
  };

  if (!teacherIDInput.disabled && teacherIDInput.value.trim()) {
    updatedData.teacherID = teacherIDInput.value.trim();
  }

  if (!facultyInput.disabled && facultyInput.value.trim()) {
    updatedData.faculty = facultyInput.value.trim();
  }

  try {
    const userRef = doc(db, "users", userSession.uid);
    await updateDoc(userRef, updatedData);

    alert("Profile updated successfully!");

    if (updatedData.teacherID) {
      teacherIDInput.disabled = true;
    }
    if (updatedData.faculty) {
      facultyInput.disabled = true;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile.");
  }
});



loadTeacherProfile();

//event listeners to show toast every time user clicks the restricted fields
document.getElementById('teacherID').addEventListener('click', () => {
    showToast("You can only set your Teacher ID once.");
  });
  
  document.getElementById('faculty').addEventListener('click', () => {
    showToast("You can only set your Faculty once.");
  });
  