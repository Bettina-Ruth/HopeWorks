(function () {
  const form = document.getElementById("registerForm");
  const registerMessage = document.getElementById("registerMessage");
  const canvas = document.getElementById("signatureCanvas");
  const signatureMessage = document.getElementById("signatureMessage");
  const saveSignatureButton = document.getElementById("saveSignatureButton");
  const clearSignatureButton = document.getElementById("clearSignatureButton");

  if (!form || !canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  let drawing = false;
  let lastPoint = null;

  function broadcastProfileUpdate() {
    window.dispatchEvent(new CustomEvent("hopeworks:profile-updated"));
  }

  function getUserFromStorage() {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Could not parse saved registration.", error);
      return null;
    }
  }

  function fillForm(user) {
    // DOM usage: existing inputs are targeted with getElementById before values are assigned.
    document.getElementById("registerName").value = user.name || "";
    document.getElementById("registerEmail").value = user.email || "";
    document.getElementById("registerPassword").value = user.password || "";
    document.getElementById("registerRole").value = user.role || "";
  }

  function paintCanvasBackground() {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  function getPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;

    return {
      x: (event.clientX - bounds.left) * scaleX,
      y: (event.clientY - bounds.top) * scaleY
    };
  }

  function startDrawing(event) {
    drawing = true;
    const point = getPoint(event);
    lastPoint = point;
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event) {
    if (!drawing) {
      return;
    }

    const point = getPoint(event);
    const midPointX = (lastPoint.x + point.x) / 2;
    const midPointY = (lastPoint.y + point.y) / 2;

    // Canvas logic: quadratic curves and rounded caps make mouse strokes smoother.
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = "#0f172a";
    context.quadraticCurveTo(lastPoint.x, lastPoint.y, midPointX, midPointY);
    context.stroke();
    lastPoint = point;
  }

  function stopDrawing() {
    if (!drawing) {
      return;
    }

    drawing = false;
    lastPoint = null;
    context.closePath();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Variable assignment: form values are read from the DOM and stored in named variables.
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;
    const existingUser = getUserFromStorage();

    // localStorage persistence: save the registration payload as JSON.
    const user = {
      name: name,
      email: email,
      password: password,
      role: role,
      signature: existingUser && existingUser.signature ? existingUser.signature : ""
    };

    localStorage.setItem("user", JSON.stringify(user));
    registerMessage.classList.remove("error-message");
    registerMessage.textContent = "Account created successfully. You can now log in.";

    if (localStorage.getItem("isLoggedIn") === "true") {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }

    if (typeof window.parent.updateNavbarAuthState === "function") {
      window.parent.updateNavbarAuthState();
    }

    broadcastProfileUpdate();
  });

  saveSignatureButton.addEventListener("click", function () {
    const user = getUserFromStorage();

    if (!user) {
      signatureMessage.classList.add("error-message");
      signatureMessage.textContent = "Register first, then save your signature.";
      return;
    }

    // Canvas signature logic: save the drawing as a base64 image in localStorage.
    user.signature = canvas.toDataURL("image/png");
    localStorage.setItem("user", JSON.stringify(user));
    if (localStorage.getItem("isLoggedIn") === "true") {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
    signatureMessage.classList.remove("error-message");
    signatureMessage.textContent = "Signature saved to your profile.";
    broadcastProfileUpdate();
  });

  clearSignatureButton.addEventListener("click", function () {
    paintCanvasBackground();
    signatureMessage.classList.remove("error-message");
    signatureMessage.textContent = "Signature pad cleared.";
  });

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

  const existingUser = getUserFromStorage();
  if (existingUser) {
    fillForm(existingUser);
  }

  paintCanvasBackground();
})();
