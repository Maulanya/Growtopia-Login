function loadSavedData() {
  const savedGrowId = localStorage.getItem("growId");
  const savedPassword = localStorage.getItem("password");
  const savedCheck = localStorage.getItem("savedCheck");

  if (savedCheck === "true") {
    document.getElementById("saveddata").checked = true;
  }

  if (savedGrowId) {
    document.getElementById("login-name").value = savedGrowId;
  }
  if (savedPassword) {
    document.getElementById("password").value = savedPassword;
  }
}

function saveData(e) {
  try {
    const keepLoggedIn = document.getElementById("saveddata").checked;

    if (keepLoggedIn) {
      localStorage.setItem(
        "growId",
        document.getElementById("login-name").value
      );
      localStorage.setItem(
        "password",
        document.getElementById("password").value
      );
      localStorage.setItem("savedCheck", "true");
    } else {
      localStorage.removeItem("growId");
      localStorage.removeItem("password");
      localStorage.setItem("savedCheck", "false");
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadSavedData);

document.getElementById("login-form").addEventListener("submit", saveData);
