import { auth, db, logoutUser } from './firebase-auth.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const userSession = JSON.parse(sessionStorage.getItem("user")); // was "user"
if (!userSession) {
  window.location.href = "login.html";
}

console.log("User session:", userSession); // debug log

document.getElementById('name').value = `${userSession.firstName || ''} ${userSession.lastName || ''}`.trim();
document.getElementById('email').value = userSession.email || '';


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
// Flag to track if alert was already shown
let alertShown = false;

async function loadStudentProfile() {
  try {
    const userRef = doc(db, "users", userSession.uid);
    const userSnap = await getDoc(userRef);

    console.log("User exists:", userSnap.exists());
console.log("User data:", userSnap.data());

    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log("Fetched user data:", data);
    
      const studentIDInput = document.getElementById('studentID');
      const blockInput = document.getElementById('block');
      const yearInput = document.getElementById('year');
      const programInput = document.getElementById('program');
      const contactInput = document.getElementById('contactNo');
    
      // Auto-fill or extract student ID
      if (data.studentID && data.studentID.trim().length > 0) {
        studentIDInput.value = data.studentID;
        studentIDInput.disabled = true;
      } else {
        const domain = "@gordoncollege.edu.ph";
        if (userSession.email.endsWith(domain)) {
          const idFromEmail = userSession.email.replace(domain, "");
          studentIDInput.value = idFromEmail;
        }
        studentIDInput.addEventListener("focus", showEditWarningOnce);
      }
    
      blockInput.value = data.block || '';
      yearInput.value = data.year || '';
      programInput.value = data.program || '';
      contactInput.value = data.contactNumber || '';
    
      if (data.block && data.block.trim().length > 0) {
        blockInput.disabled = true;
      } else {
        blockInput.addEventListener("focus", showEditWarningOnce);
      }
    }
    
  } catch (error) {
    console.error("Error loading student profile:", error);
  }
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentIDInput = document.getElementById('studentID');
  const blockInput = document.getElementById('block');
  const yearInput = document.getElementById('year');
  const programInput = document.getElementById('program');
  const contactInput = document.getElementById('contactNo');

  const updatedData = {
    year: yearInput.value.trim(),
    program: programInput.value.trim(),
    block: blockInput.value.trim(),
    contactNumber: contactInput.value.trim()
  };
  

  if (!programInput.disabled && programInput.value.trim()) {
    updatedData.program = programInput.value.trim();
  }


  try {
    const userRef = doc(db, "users", userSession.uid);
    await updateDoc(userRef, updatedData);

    alert("Profile updated successfully!");

    if (updatedData.program) {
      programInput.disabled = true;
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile.");
  }
});

function showEditWarningOnce() {
  if (!alertShown) {
    showToast("This field can only be set once.");
    alertShown = true;
  }
}

loadStudentProfile();

//event listeners to show toast every time user clicks the restricted fields
document.getElementById('studentID').addEventListener('click', () => {
  showToast("You can only set your Student ID once.");
});