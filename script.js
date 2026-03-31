function showMessage(msg) {
  alert(msg);
}

function goToPage() {
  window.location.href = "findjobs.html";
}

function goToPage2() {
  window.location.href = "postajob.html";
}

function getStoredUser() {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Stored user data could not be parsed.", error);
    return null;
  }
}

function getCurrentUser() {
  const savedUser = localStorage.getItem("currentUser");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Current user data could not be parsed.", error);
    return null;
  }
}

function isUserLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

function setLoginState(isLoggedIn) {
  localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
}

function logoutUser() {
  // Login/logout flow: clear auth state and return to the main homepage entry.
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("redirectAfterLogin");
  updateNavbarAuthState();

  if (window.parent && window.parent !== window) {
    window.parent.updateNavbarAuthState();
    window.parent.location.href = "index.html";
    return;
  }

  const frame = document.querySelector('iframe[name="contentFrame"]');
  if (frame) {
    window.location.href = "index.html";
  } else {
    window.location.href = "index.html";
  }
}

function updateNavbarAuthState() {
  const loginItem = document.getElementById("loginBtn");
  const registerItem = document.getElementById("registerBtn");
  const logoutItem = document.getElementById("logoutBtn");

  if (!loginItem || !registerItem || !logoutItem) {
    return;
  }

  // Navbar logic: guests see Login/Register, authenticated users see Logout only.
  if (isUserLoggedIn()) {
    loginItem.style.display = "none";
    registerItem.style.display = "none";
    logoutItem.style.display = "block";
  } else {
    loginItem.style.display = "block";
    registerItem.style.display = "block";
    logoutItem.style.display = "none";
  }
}

function bindFrameNavigation() {
  const frame = document.querySelector('iframe[name="contentFrame"]');

  if (!frame) {
    return;
  }

  document.querySelectorAll('a[target="contentFrame"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      frame.src = link.getAttribute("href");
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Default state: if isLoggedIn is missing or not "true", the UI stays logged out.
  updateNavbarAuthState();
  bindFrameNavigation();

  if (window.parent && window.parent !== window && typeof window.parent.updateNavbarAuthState === "function") {
    window.parent.updateNavbarAuthState();
  }
});
