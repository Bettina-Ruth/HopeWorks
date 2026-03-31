(function () {
  const applyButtons = document.querySelectorAll(".apply-button");

  if (!applyButtons.length) {
    return;
  }

  applyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const loggedIn = typeof isUserLoggedIn === "function" && isUserLoggedIn();
      const jobTitle = button.getAttribute("data-job-title") || "this job";

      // Access control: job cards stay visible, but applying requires an active login.
      if (!loggedIn) {
        alert("Please login to apply");
        window.location.href = "login.html";
        return;
      }

      alert("Application submitted for " + jobTitle + ".");
    });
  });
})();
