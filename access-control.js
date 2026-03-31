(function () {
  const message = document.getElementById("pageAccessMessage");
  const protectedContent = document.getElementById("protectedPageContent");

  if (!message || !protectedContent) {
    return;
  }

  // Access control: only logged-in users can view the protected job and post-job content.
  if (localStorage.getItem("isLoggedIn") === "true") {
    message.textContent = "Access granted. You can use this page.";
    message.classList.add("access-success");
    protectedContent.style.display = "block";
    return;
  }

  message.textContent = "Please register/login to access this page";
  protectedContent.style.display = "none";
})();
