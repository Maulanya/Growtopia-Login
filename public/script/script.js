function isLocalStorageAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function loadSavedData() {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available.");
    return;
  }

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
  e.preventDefault();

  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available.");
    e.target.submit();
    return;
  }

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

  e.target.submit();
}

document.addEventListener("DOMContentLoaded", loadSavedData);

document.getElementById("login-form").addEventListener("submit", saveData);
