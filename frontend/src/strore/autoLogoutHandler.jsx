import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogoutHandler = () => {
  const navigate = useNavigate();
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 Minutes in milliseconds

  useEffect(() => {
    // Check karein ki kya user ne "Remember Me" select kiya tha
    // Hum check karenge ki token kahan hai: localStorage (Remember Me) ya sessionStorage (Normal)
    const isRemembered = localStorage.getItem("token") !== null;

    if (isRemembered) return; // Agar "Remember Me" hai to niche wala code nahi chalega

    let logoutTimer;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);

      // 15 min ka timer set karein
      logoutTimer = setTimeout(() => {
        handleLogout("Inactivity logout");
      }, INACTIVITY_LIMIT);

      // Last active time save karein (Sleep detection ke liye)
      sessionStorage.setItem("lastActive", Date.now().toString());
    };

    const handleLogout = (reason) => {
      console.log(reason);
      sessionStorage.clear();
      localStorage.removeItem("user"); // User info delete
      navigate("/");
    };

    // Sleep Mode / Lock detection logic
    const checkSessionOnFocus = () => {
      const lastActive = sessionStorage.getItem("lastActive");
      if (lastActive) {
        const diff = Date.now() - parseInt(lastActive);
        // Agar system 15 min se zyada band/sleep raha to logout
        if (diff > INACTIVITY_LIMIT) {
          handleLogout("System wake-up timeout");
        }
      }
    };

    // Listeners for activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    // Listen for wake up (PC lock/sleep se wapas aane par)
    window.addEventListener("focus", checkSessionOnFocus);

    resetTimer(); // Start timer on mount

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("focus", checkSessionOnFocus);
      clearTimeout(logoutTimer);
    };
  }, [navigate]);

  return null;
};

export default AutoLogoutHandler;
