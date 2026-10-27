import { Button as SharedButton } from "../common/UI";
import { Button } from "../common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import execReq from "../../lib/execReq";
import useAuthStore from "../../strore/authStore";
import { useNavigate } from "react-router-dom";

// Standard Official Google multi-color SVG icon
export const GoogleSvgIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill={themeColors.info}
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill={themeColors.success}
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill={themeColors.warning}
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill={themeColors.primary}
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const InnerGoogleButton = ({ onSuccess, onError, text = "Continue with Google" }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleOAuthSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      // If code/access_token received, exchange with backend
      const res = await execReq.post("/auth/google", {
        credential: tokenResponse.credential || tokenResponse.access_token,
      });

      const payload = res.data?.data || res.data;
      const accessToken = payload.accessToken || payload.token;
      const user = payload.user;

      if (accessToken && user) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("hrms_token", accessToken);
        localStorage.setItem("hrms_user", JSON.stringify(user));
        setAuth({ user, accessToken });
        navigate("/dashboard");
        if (onSuccess) onSuccess(payload);
      }
    } catch (err) {
      console.error("Google Auth backend error:", err);
      if (onError) onError(err.response?.data?.message || err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleOAuthSuccess,
    onError: (error) => {
      console.warn("Google OAuth Client Error:", error);
      if (onError) onError("Google Sign-In was cancelled or encountered an error.");
    },
  });

  return (
    <SharedButton variant="ghost"
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[4px] border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
      ) : (
        <GoogleSvgIcon />
      )}
      <span>{loading ? "Connecting to Google..." : text}</span>
    </SharedButton>
  );
};

export const GoogleAuthButton = ({ onSuccess, onError, text = "Continue with Google" }) => {
 const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
 if (!clientId) return <Button variant="outline" fullWidth disabled title="Google sign-in is not configured">{text}</Button>;
 return <GoogleOAuthProvider clientId={clientId}><InnerGoogleButton onSuccess={onSuccess} onError={onError} text={text} /></GoogleOAuthProvider>;
};
export default GoogleAuthButton;
