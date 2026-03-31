(function () {
  const rootElement = document.getElementById("profile-root");

  if (!rootElement || typeof React === "undefined" || typeof ReactDOM === "undefined") {
    return;
  }

  const root = ReactDOM.createRoot(rootElement);

  function readStoredProfile() {
    const rawData = localStorage.getItem("user");

    if (!rawData) {
      return null;
    }

    try {
      return JSON.parse(rawData);
    } catch (error) {
      console.error("Profile data could not be parsed.", error);
      return null;
    }
  }

  function ProfileField(props) {
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
      React.createElement("h3", null, "No profile saved yet"),
      React.createElement(
        "p",
        null,
        "Complete the registration form to see your HopeWorks profile render here."
      )
    );
  }

  function UserProfileCard(props) {
    const profile = props.profile;
    const initials = profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(function (namePart) {
        return namePart.charAt(0).toUpperCase();
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
          React.createElement("h3", null, profile.name),
          React.createElement("p", null, profile.email)
        )
      ),
      React.createElement(
        "div",
        { className: "profile-grid" },
        React.createElement(ProfileField, { label: "Name", value: profile.name }),
        React.createElement(ProfileField, { label: "Email", value: profile.email }),
        React.createElement(ProfileField, { label: "Role", value: profile.role || "Not selected" })
      ),
      profile.signature
        ? React.createElement(
            "div",
            { className: "signature-preview-wrap" },
            React.createElement("strong", null, "Saved Signature"),
            React.createElement("img", {
              className: "signature-preview",
              src: profile.signature,
              alt: "Saved user signature"
            })
          )
        : null,
      React.createElement(
        "p",
        { className: "profile-caption" },
        "React rendering: this panel reads localStorage and shows profile details without exposing the password or raw signature data."
      )
    );
  }

  function UserProfileApp() {
    const initialProfile = readStoredProfile();
    const statePair = React.useState(initialProfile);
    const profile = statePair[0];
    const setProfile = statePair[1];

    React.useEffect(function () {
      // React rendering: when localStorage-backed profile data changes, this state sync triggers a re-render.
      function syncProfile() {
        setProfile(readStoredProfile());
      }

      window.addEventListener("hopeworks:profile-updated", syncProfile);
      window.addEventListener("storage", syncProfile);

      return function () {
        window.removeEventListener("hopeworks:profile-updated", syncProfile);
        window.removeEventListener("storage", syncProfile);
      };
    }, []);

    return profile
      ? React.createElement(UserProfileCard, { profile: profile })
      : React.createElement(EmptyProfile);
  }

  root.render(React.createElement(UserProfileApp));
})();
