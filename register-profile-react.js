(function () {
  const mountNode = document.getElementById("profile-root");

  if (!mountNode || typeof React === "undefined" || typeof ReactDOM === "undefined") {
    return;
  }

  const root = ReactDOM.createRoot(mountNode);

  function readUser() {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch (error) {
      console.error("Could not read saved user profile.", error);
      return null;
    }
  }

  function ProfileDetail(props) {
    return React.createElement(
      "div",
      { className: "profile-detail" },
      React.createElement("span", null, props.label),
      React.createElement("strong", null, props.value)
    );
  }

  function EmptyProfile() {
    return React.createElement(
      "div",
      { className: "profile-panel profile-panel-empty" },
      React.createElement("h3", null, "No saved profile yet"),
      React.createElement("p", null, "Register above to see your saved HopeWorks profile.")
    );
  }

  function UserProfile(props) {
    const user = props.user;
    const initials = user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join("");

    return React.createElement(
      "div",
      { className: "profile-panel" },
      React.createElement(
        "div",
        { className: "profile-header" },
        React.createElement("div", { className: "profile-avatar" }, initials || "HW"),
        React.createElement(
          "div",
          null,
          React.createElement("h3", null, user.name),
          React.createElement("p", null, user.email)
        )
      ),
      React.createElement(
        "div",
        { className: "profile-grid" },
        React.createElement(ProfileDetail, { label: "Name", value: user.name }),
        React.createElement(ProfileDetail, { label: "Email", value: user.email })
      ),
      user.signature
        ? React.createElement(
            "div",
            { className: "signature-preview-wrap" },
            React.createElement("strong", null, "Saved Signature"),
            React.createElement("img", {
              className: "signature-preview",
              src: user.signature,
              alt: "Saved signature preview"
            })
          )
        : null,
      React.createElement("p", { className: "profile-bio" }, "React rendering: this profile card updates from localStorage data."),
      React.createElement(
        "div",
        { className: "profile-actions" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: function () {
              const nameInput = document.getElementById("registerName");
              if (nameInput) {
                nameInput.focus();
              }
            }
          },
          "Edit Data"
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: function () {
              localStorage.removeItem("user");
              localStorage.removeItem("currentUser");
              localStorage.removeItem("isLoggedIn");
              window.dispatchEvent(new CustomEvent("hopeworks:profile-updated"));

              if (typeof updateNavbarVisibility === "function") {
                updateNavbarVisibility();
              }

              if (window.parent && window.parent !== window && typeof window.parent.updateNavbarVisibility === "function") {
                window.parent.updateNavbarVisibility();
              }
            }
          },
          "Clear Data"
        )
      )
    );
  }

  function ProfileApp() {
    const state = React.useState(readUser());
    const user = state[0];
    const setUser = state[1];

    React.useEffect(function () {
      function syncUser() {
        setUser(readUser());
      }

      window.addEventListener("hopeworks:profile-updated", syncUser);
      window.addEventListener("storage", syncUser);

      return function () {
        window.removeEventListener("hopeworks:profile-updated", syncUser);
        window.removeEventListener("storage", syncUser);
      };
    }, []);

    return user
      ? React.createElement(UserProfile, { user: user })
      : React.createElement(EmptyProfile);
  }

  root.render(React.createElement(ProfileApp));
})();
