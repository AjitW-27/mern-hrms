import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
    // The persist middleware automatically syncs your state with localStorage
    persist(
        (set) => ({
            user: null,
            token: null,

            setAuth: (data) => {
                const token = data.accessToken || data.token;
                if (token) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("hrms_token", token);
                }
                if (data.user) localStorage.setItem("hrms_user", JSON.stringify(data.user));
                set({
                    user: data.user,
                    token,
                });
            },

            logout: () => {
                localStorage.removeItem("token");
                localStorage.removeItem("hrms_token");
                localStorage.removeItem("hrms_user");
                sessionStorage.removeItem("token");
                set({
                    user: null,
                    token: null,
                });
            },
        }),
        {
            name: "auth-storage", // The key used in localStorage
        }
    )
);

export default useAuthStore;
