const DEMO_JOBS = [
  {
    id: "demo-delivery-helper",
    title: "Delivery Helper",
    location: "Coimbatore",
    type: "Part-time",
    description: "Assist a neighborhood grocery store with short-distance package delivery.",
    owner: "HopeWorks Team"
  },
  {
    id: "demo-house-cleaning",
    title: "House Cleaning Assistant",
    location: "Chennai",
    type: "Flexible hours",
    description: "Support a family with home cleaning for a two-bedroom apartment.",
    owner: "HopeWorks Team"
  },
  {
    id: "demo-moving-helper",
    title: "Moving Helper",
    location: "Bengaluru",
    type: "Daily wage",
    description: "Help load, move, and unpack household items for a same-day relocation.",
    owner: "HopeWorks Team"
  }
];

function getTopWindow() {
  try {
    if (window.top && window.top.location && window.top.location.origin === window.location.origin) {
      return window.top;
    }
  } catch (error) {
    console.error("Could not access top window.", error);
  }

  return window;
}

function getAppState() {
  const topWindow = getTopWindow();

  if (!topWindow.hopeWorksState) {
    topWindow.hopeWorksState = {
      users: [],
      currentUser: null,
      lastRegisteredUser: null,
      registeredCredentials: null,
      jobs: DEMO_JOBS.map(function (job) {
        return Object.assign({}, job);
      }),
      pendingAction: "",
      signatureData: ""
    };
  }

  return topWindow.hopeWorksState;
}

function getUsers() {
  return getAppState().users;
}

function getCurrentUser() {
  return getAppState().currentUser;
}

function setCurrentUser(user) {
  getAppState().currentUser = user;
}

function getLastRegisteredUser() {
  return getAppState().lastRegisteredUser;
}

function setLastRegisteredUser(user) {
  getAppState().lastRegisteredUser = user;
}

function registerSessionUser(user) {
  const existingUser = findUserByEmail(user.email);

  if (!existingUser) {
    getUsers().push(user);
  }

  setLastRegisteredUser(user);
}

function isUserLoggedIn() {
  return Boolean(getCurrentUser());
}

function getJobs() {
  return getAppState().jobs;
}

function findUserByEmail(email) {
  return getUsers().find(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  }) || null;
}

function findLoginUser(email, password) {
  const user = getUsers().find(function (u) {
    return (
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
    );
  });

  return user || null;
}

function showMessage(message) {
  alert(message);
}

function getShellFrame() {
  return document.querySelector('iframe[name="contentFrame"]');
}

function setShellPage(page) {
  const frame = getShellFrame();

  if (frame) {
    frame.src = page;
  }
}

function loadIntoFrame(page) {
  const frame = getShellFrame();

  if (!frame) {
    window.location.href = page;
    return;
  }

  frame.src = page;

  if (window.history && window.history.replaceState) {
    window.history.replaceState({}, "", "hopeworks.html?page=" + encodeURIComponent(page));
  }
}

function openAppPage(page) {
  const topWindow = getTopWindow();

  if (topWindow !== window && typeof topWindow.loadIntoFrame === "function") {
    topWindow.loadIntoFrame(page);
    return;
  }

  if (document.body && document.body.dataset.page === "shell") {
    setShellPage(page);
    return;
  }

  window.location.href = page;
}

function redirectToShell(page) {
  window.location.href = "hopeworks.html?page=" + encodeURIComponent(page || "homepage.html");
}

function ensureNavbarShell() {
  const isShellPage = document.body && document.body.dataset.page === "shell";

  if (isShellPage) {
    return;
  }

  if (window.top !== window) {
    return;
  }

  const currentPath = window.location.pathname.split("/").pop() || "homepage.html";

  if (currentPath === "hopeworks.html" || currentPath === "index.html") {
    return;
  }

  redirectToShell(currentPath);
}

function redirectToLogin(reason) {
  getAppState().pendingAction = reason || "";

  const topWindow = getTopWindow();

  if (topWindow !== window && typeof topWindow.loadIntoFrame === "function") {
    topWindow.loadIntoFrame("login.html");
    return;
  }

  window.location.href = "login.html";
}

function updateNavbarAuthState() {
  const loginItem = document.getElementById("loginBtn");
  const registerItem = document.getElementById("registerBtn");
  const logoutItem = document.getElementById("logoutBtn");
  const loggedIn = isUserLoggedIn();

  if (loginItem) {
    loginItem.style.display = loggedIn ? "none" : "inline-flex";
  }

  if (registerItem) {
    registerItem.style.display = loggedIn ? "none" : "inline-flex";
  }

  if (logoutItem) {
    logoutItem.style.display = loggedIn ? "inline-flex" : "none";
  }
}

function refreshShellNavbar() {
  const topWindow = getTopWindow();

  if (topWindow !== window && typeof topWindow.updateNavbarAuthState === "function") {
    topWindow.updateNavbarAuthState();
  } else {
    updateNavbarAuthState();
  }
}

function logoutUser() {
  getAppState().currentUser = null;
  getAppState().pendingAction = "";
  refreshShellNavbar();

  const topWindow = getTopWindow();

  if (topWindow !== window) {
    topWindow.loadIntoFrame("homepage.html");
    return;
  }

  redirectToShell("homepage.html");
}

function attachStatusMessage(element, text, isError) {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.toggle("error-message", Boolean(isError));
  element.classList.toggle("success-message", !isError);
}

function goToPage() {
  openAppPage("findjobs.html");
}

function goToPage2() {
  openAppPage("postajob.html");
}

function bindShellNavigation() {
  document.querySelectorAll("[data-page-link]").forEach(function (link) {
    if (link.dataset.bound === "true") {
      return;
    }

    link.dataset.bound = "true";
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const targetPage = link.getAttribute("data-page-link");
      loadIntoFrame(targetPage);
    });
  });

  const logoutButton = document.getElementById("logoutBtn");

  if (logoutButton && logoutButton.dataset.bound !== "true") {
    logoutButton.dataset.bound = "true";
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      logoutUser();
    });
  }
}

function drawProfile() {
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileRole = document.getElementById("profileRole");
  const profileStatus = document.getElementById("profileStatus");
  const profileUser = getCurrentUser() || getLastRegisteredUser();

  if (!profileName || !profileEmail || !profileRole || !profileStatus) {
    return;
  }

  if (!profileUser) {
    profileStatus.textContent = "Please login to view profile";
    profileName.textContent = "-";
    profileEmail.textContent = "-";
    profileRole.textContent = "-";
    return;
  }

  profileStatus.textContent = getCurrentUser() ? "Logged in user details" : "Recently registered user details";
  profileName.textContent = profileUser.name;
  profileEmail.textContent = profileUser.email;
  profileRole.textContent = profileUser.role;
}

function initializeRegisterPage() {
  const form = document.getElementById("registerForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;
    const registerMessage = document.getElementById("registerMessage");

    if (!name || !email || !password || !role) {
      attachStatusMessage(registerMessage, "Please complete all registration fields.", true);
      return;
    }

    if (findUserByEmail(email)) {
      attachStatusMessage(registerMessage, "An account with this email already exists in this session.", true);
      return;
    }

    const user = {
      name: name,
      email: email,
      password: password,
      role: role
    };

    registerSessionUser(user);

    attachStatusMessage(registerMessage, "Registration successful. These credentials are now valid for login in this session.", false);
    form.reset();
    drawProfile();
  });
}

function initializeLoginPage() {
  const form = document.getElementById("loginForm");

  if (!form) {
    return;
  }

  const loginNote = document.getElementById("loginNote");
  const pendingAction = getAppState().pendingAction;
  const loginEmailInput = document.getElementById("loginEmail");
  const loginPasswordInput = document.getElementById("loginPassword");

  if (loginNote && pendingAction) {
    loginNote.textContent = "Please log in to continue.";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");
    const user = findLoginUser(email, password);

    if (!user) {
      attachStatusMessage(loginMessage, "Invalid email or password.", true);
      return;
    }

    setCurrentUser(user);
    setLastRegisteredUser(user);
    getAppState().pendingAction = "";
    attachStatusMessage(loginMessage, "Login successful. Redirecting to the homepage...", false);
    refreshShellNavbar();

    setTimeout(function () {
      const topWindow = getTopWindow();

      if (topWindow !== window) {
        topWindow.loadIntoFrame("homepage.html");
        return;
      }

      redirectToShell("homepage.html");
    }, 700);
  });
}

function createJobCard(job) {
  const jobCard = document.createElement("article");
  jobCard.className = "job-card";

  const jobMeta = document.createElement("div");
  jobMeta.className = "job-meta";

  const typeBadge = document.createElement("span");
  typeBadge.textContent = job.type;

  const locationBadge = document.createElement("span");
  locationBadge.textContent = job.location;

  jobMeta.appendChild(typeBadge);
  jobMeta.appendChild(locationBadge);

  const title = document.createElement("h3");
  title.textContent = job.title;

  const description = document.createElement("p");
  description.textContent = job.description;

  const footer = document.createElement("div");
  footer.className = "job-footer";

  const owner = document.createElement("span");
  owner.className = "job-owner";
  owner.textContent = "Posted by " + (job.owner || "Community Hirer");

  const applyButton = document.createElement("button");
  applyButton.type = "button";
  applyButton.className = "apply-button";
  applyButton.textContent = "Apply";
  applyButton.dataset.jobTitle = job.title;
  applyButton.addEventListener("click", function () {
    handleApplyClick(job.title);
  });

  footer.appendChild(owner);
  footer.appendChild(applyButton);

  jobCard.appendChild(jobMeta);
  jobCard.appendChild(title);
  jobCard.appendChild(description);
  jobCard.appendChild(footer);

  return jobCard;
}

function renderJobs() {
  const jobsContainer = document.getElementById("jobsContainer");

  if (!jobsContainer) {
    return;
  }

  jobsContainer.innerHTML = "";

  getJobs().forEach(function (job) {
    jobsContainer.appendChild(createJobCard(job));
  });
}

function handleApplyClick(jobTitle) {
  const applicationPanel = document.getElementById("applicationPanel");
  const selectedJobTitle = document.getElementById("selectedJobTitle");
  const applicationJobInput = document.getElementById("applicationJobTitle");
  const applicantName = document.getElementById("applicantName");
  const applicationMessage = document.getElementById("applicationMessage");

  if (!isUserLoggedIn()) {
    alert("Please login to apply.");
    redirectToLogin("apply-job");
    return;
  }

  if (applicationPanel) {
    applicationPanel.hidden = false;
  }

  if (selectedJobTitle) {
    selectedJobTitle.textContent = jobTitle;
  }

  if (applicationJobInput) {
    applicationJobInput.value = jobTitle;
  }

  if (applicantName && getCurrentUser()) {
    applicantName.value = getCurrentUser().name;
  }

  if (applicationMessage) {
    applicationMessage.textContent = "";
  }
}

function initializeJobsPage() {
  const jobsContainer = document.getElementById("jobsContainer");
  const applicationForm = document.getElementById("applicationForm");

  if (!jobsContainer) {
    return;
  }

  renderJobs();

  if (!applicationForm) {
    return;
  }

  applicationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!isUserLoggedIn()) {
      alert("Please login to apply.");
      redirectToLogin("apply-job");
      return;
    }

    const applicationMessage = document.getElementById("applicationMessage");
    attachStatusMessage(applicationMessage, "Application submitted for this session.", false);
    applicationForm.reset();
  });
}

function initializePostJobPage() {
  const form = document.getElementById("postJobForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!isUserLoggedIn()) {
      alert("Please login to post a job.");
      redirectToLogin("post-job");
      return;
    }

    const jobTitle = document.getElementById("jobTitle").value.trim();
    const jobLocation = document.getElementById("jobLocation").value.trim();
    const jobType = document.getElementById("jobType").value.trim();
    const jobDescription = document.getElementById("jobDescription").value.trim();
    const postJobMessage = document.getElementById("postJobMessage");
    const currentUser = getCurrentUser();

    const job = {
      id: "custom-job-" + Date.now(),
      title: jobTitle,
      location: jobLocation,
      type: jobType,
      description: jobDescription,
      owner: currentUser ? currentUser.name : "HopeWorks Member"
    };

    getJobs().push(job);
    attachStatusMessage(postJobMessage, "Job posted for this session. Opening job listings...", false);
    form.reset();

    setTimeout(function () {
      const topWindow = getTopWindow();

      if (topWindow !== window) {
        topWindow.loadIntoFrame("findjobs.html");
        return;
      }

      window.location.href = "findjobs.html";
    }, 500);
  });
}

function initializeSignaturePad() {
  const canvas = document.getElementById("signatureCanvas");

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const clearButton = document.getElementById("clearSignatureButton");
  const submitButton = document.getElementById("submitSignatureButton");
  const signatureMessage = document.getElementById("signatureMessage");
  let isDrawing = false;

  function paintBackground() {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  function pointFromEvent(event) {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;

    return {
      x: (event.clientX - bounds.left) * scaleX,
      y: (event.clientY - bounds.top) * scaleY
    };
  }

  function startDrawing(event) {
    isDrawing = true;
    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event) {
    if (!isDrawing) {
      return;
    }

    const point = pointFromEvent(event);
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0f172a";
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    if (!isDrawing) {
      return;
    }

    isDrawing = false;
    context.closePath();
  }

  paintBackground();

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);
  canvas.addEventListener("touchstart", function (event) {
    event.preventDefault();
    startDrawing(event.touches[0]);
  });
  canvas.addEventListener("touchmove", function (event) {
    event.preventDefault();
    draw(event.touches[0]);
  });
  canvas.addEventListener("touchend", function (event) {
    event.preventDefault();
    stopDrawing();
  });

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
      paintBackground();
      getAppState().signatureData = "";
      attachStatusMessage(signatureMessage, "Signature pad cleared.", false);
    });
  }

  if (submitButton) {
    submitButton.addEventListener("click", function () {
      getAppState().signatureData = canvas.toDataURL("image/png");
      attachStatusMessage(signatureMessage, "Signature submitted for this session.", false);
    });
  }
}

function initializeProfileSection() {
  const profileSection = document.getElementById("profileSection");

  if (!profileSection) {
    return;
  }

  drawProfile();
  initializeSignaturePad();
}

function initializeContactForm() {
  const form = document.getElementById("contactForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const contactMessage = document.getElementById("contactMessage");
    attachStatusMessage(contactMessage, "Message sent successfully.", false);
    form.reset();
  });
}

function initializeShellFrame() {
  const frame = getShellFrame();

  if (!frame) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  frame.src = params.get("page") || "homepage.html";
}

document.addEventListener("DOMContentLoaded", function () {
  getAppState();
  ensureNavbarShell();
  updateNavbarAuthState();
  bindShellNavigation();
  initializeShellFrame();
  initializeRegisterPage();
  initializeLoginPage();
  initializeJobsPage();
  initializePostJobPage();
  initializeProfileSection();
  initializeContactForm();
});
