(function () {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // DOM usage: values are retrieved from existing login inputs with getElementById.
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const storedUser = typeof getStoredUser === "function" ? getStoredUser() : null;

    // Login logic: compare the entered credentials with the localStorage registration record.
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(storedUser));
      message.classList.remove("error-message");
      message.textContent = "Login successful. Redirecting...";

      if (typeof updateNavbarAuthState === "function") {
        updateNavbarAuthState();
      }

      if (window.parent && window.parent !== window && typeof window.parent.updateNavbarAuthState === "function") {
        window.parent.updateNavbarAuthState();
      }

      if (window.top) {
        window.top.location.href = "index.html";
        return;
      }

      window.location.href = "index.html";
      return;
    }

    message.classList.add("error-message");
    message.textContent = "Invalid email or password.";
  });
})();
