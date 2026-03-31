(function () {
  const form = document.getElementById("postJobForm");
  const message = document.getElementById("postJobMessage");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Access control: page stays public, but the submit action requires login.
    if (localStorage.getItem("isLoggedIn") !== "true") {
      alert("Please login to post jobs");
      window.location.href = "login.html";
      return;
    }

    // DOM usage: collect form values from the existing page into variables before saving.
    const title = document.getElementById("jobTitle").value.trim();
    const location = document.getElementById("jobLocation").value.trim();
    const description = document.getElementById("jobDescription").value.trim();

    const savedJobs = JSON.parse(localStorage.getItem("postedJobs") || "[]");
    savedJobs.push({
      title: title,
      location: location,
      description: description
    });

    // localStorage: keep posted job submissions in JSON array format.
    localStorage.setItem("postedJobs", JSON.stringify(savedJobs));
    message.classList.remove("error-message");
    message.textContent = "Job posted successfully.";
    form.reset();
  });
})();
