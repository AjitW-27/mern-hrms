import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionManager = () => {
  const navigate = useNavigate();

  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 min

  useEffect(() => {
    let logoutTimer;

    // 🔐 Get token from both storages
    const getToken = () => {
      return localStorage.getItem("token") || sessionStorage.getItem("token");
    };

    // 🔍 Check if remember me enabled
    const isRemembered = localStorage.getItem("rememberMe") === "true";

    // 🚪 Logout function
    const handleLogout = (reason) => {
      console.log("Logout:", reason);

      localStorage.removeItem("token");
      localStorage.removeItem("rememberMe");

      sessionStorage.clear();

      navigate("/");
    };

    // ⏱ Reset inactivity timer
    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);

      // ❌ If Remember Me → skip auto logout
      if (isRemembered) return;

      logoutTimer = setTimeout(() => {
        handleLogout("Inactivity logout");
      }, INACTIVITY_LIMIT);

      sessionStorage.setItem("lastActive", Date.now().toString());
    };

    // 💤 Detect system sleep / lock
    const checkSessionOnFocus = () => {
      const lastActive = sessionStorage.getItem("lastActive");

      if (!lastActive) return;

      const diff = Date.now() - parseInt(lastActive);

      if (!isRemembered && diff > INACTIVITY_LIMIT) {
        handleLogout("System wake-up timeout");
      }
    };

    // 🔐 If no token → redirect
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    // 👂 Activity listeners
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    // 💤 Wake-up detection
    window.addEventListener("focus", checkSessionOnFocus);

    // Start timer
    resetTimer();

    return () => {
      clearTimeout(logoutTimer);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("focus", checkSessionOnFocus);
    };
  }, [navigate]);

  return null;
};

export default SessionManager;
