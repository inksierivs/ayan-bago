import { logoutUser, db } from './firebase-auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.getElementById("logoutButton").addEventListener("click", logoutUser);

const addClassForm = document.getElementById("addClassForm");
const classList = document.getElementById("classList");

addClassForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const subjectName = document.getElementById("subjectName").value;
  const classCode = document.getElementById("classCode").value;
  const schedule = document.getElementById("schedule").value;
  const room = document.getElementById("room").value;
  const year = document.getElementById("year").value;
  const block = document.getElementById("block").value;
  const program = document.getElementById("program").value;

  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || user.role !== "teacher") {
    alert("Unauthorized. Only teachers can add classes.");
    return;
  }

  const classData = {
    teacherId: user.uid,
    subjectName,
    classCode,
    schedule,
    room,
    year,
    block,
    program,
    createdAt: serverTimestamp()
  };

  try {
    // Save to Firestore
    const docRef = await addDoc(collection(db, "classes"), classData);
    addClassToList(classData, docRef.id); // <-- important!
    

    // Close modal and reset form
    closeModal();
    addClassForm.reset();

    alert("Class added successfully!");
  } catch (err) {
    console.error("Error adding class:", err);
    alert("Failed to add class.");
  }
});

// Dynamically adds a class card to the DOM
window.addClassToList = function (classData, id = null) {
    const classCard = document.createElement("div");
    classCard.classList.add("class-card");
  
    if (id) {
      classCard.dataset.classId = id; // Store Firestore document ID
    }
  
    classCard.innerHTML = `
      <div class="class-info">
        <h3 class="class-name">${classData.subjectName}</h3>
        <p class="class-time">${classData.schedule}</p>
        <p class="class-code">${classData.classCode}</p>
        <p class="class-room">${classData.room}</p>
        <a href="#" class="remove-link">Remove</a>
      </div>
      <div class="class-thumbnail">X</div>
    `;
  
    // 🗑 Remove class
    classCard.querySelector(".remove-link").addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation(); // So it doesn't trigger card click
      removeClass(classCard);
    });
  
    // 📄 Go to class view on card click
    classCard.addEventListener("click", function () {
      const classId = classCard.dataset.classId;
      if (classId) {
        window.location.href = `class-view.html?id=${classId}`;
      }
    });
  
    classList.appendChild(classCard);
  };
  
  

// Remove class card from UI
window.removeClass = async function (classCard) {
    const classId = classCard.dataset.classId;
  
    if (!classId) {
      console.error("No class ID found.");
      return;
    }
  
    const confirmDelete = confirm("Are you sure you want to delete this class?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "classes", classId));
      classCard.remove();
      alert("Class deleted successfully.");
    } catch (err) {
      console.error("Error deleting class:", err);
      alert("Failed to delete class.");
    }
  };


// Modal controls
window.openModal = function () {
  document.getElementById("classModal").classList.remove("hidden");
};

window.closeModal = function () {
  document.getElementById("classModal").classList.add("hidden");
};

import { query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Fetch and display classes for the current teacher
async function loadTeacherClasses() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || user.role !== "teacher") {
    return;
  }

  try {
    const q = query(collection(db, "classes"), where("teacherId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
        const classData = docSnap.data();
        addClassToList(classData, docSnap.id); // ✅ pass ID
      });
      
  } catch (err) {
    console.error("Error loading classes:", err);
    alert("Failed to load classes.");
  }
}

// 🔥 Load classes when the page loads
window.addEventListener("DOMContentLoaded", loadTeacherClasses);
