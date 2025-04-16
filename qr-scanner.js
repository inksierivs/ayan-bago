import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { app, db, logoutUser } from './firebase-auth.js';

const userSession = JSON.parse(sessionStorage.getItem("user"));

if (!userSession) {
  window.location.href = "login.html";
}

const html5QrCode = new Html5Qrcode("reader");
let currentCamId = null;

const scanOptions = {
  fps: 15,
  qrbox: 250,
  videoConstraints: { facingMode: "environment" }
};

const startScanner = () => {
  html5QrCode.start(
    { deviceId: { exact: currentCamId } },
    scanOptions,
    async (decodedText) => {
      html5QrCode.stop();
      const userRef = doc(db, "users", userSession.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();

        document.getElementById("modalContent").innerHTML = `
          <strong>ID:</strong> ${decodedText}<br>
          <strong>Name:</strong> ${data.firstName} ${data.lastName}<br>
          <strong>Program:</strong> ${data.program}<br>
          <strong>Year & Block:</strong> ${data.year} - ${data.block}
        `;
        document.getElementById("studentModal").classList.remove("hidden");

        document.getElementById("confirmBtn").onclick = () => {
          sessionStorage.setItem("studentName", JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName
          }));
          window.location.href = `photo-capture.html?studentID=${decodedText}`;
        };
      } else {
        document.getElementById("result").textContent = "❌ Student not found.";
      }
    },
    (error) => {
      // Silent fail on decode errors
    }
  );
};

Html5Qrcode.getCameras().then(devices => {
  if (devices.length) {
    currentCamId = devices[0].id;
    startScanner();
  }
});

document.getElementById("scan-again").onclick = () => {
  document.getElementById("result").textContent = "";
  startScanner();
};

window.closeModal = () => {
  document.getElementById("studentModal").classList.add("hidden");
  startScanner();
};
