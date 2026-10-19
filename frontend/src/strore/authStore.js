// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// const useAuthStore = create(
//     // The persist middleware automatically syncs your state with localStorage
//     persist(
//         (set) => ({
//             user: null,
//             token: null,

//             setAuth: (data) => {
//                 const token = data.accessToken || data.token;
//                 if (token) {
//                     localStorage.setItem("token", token);
//                     localStorage.setItem("hrms_token", token);
//                 }
//                 if (data.user) localStorage.setItem("hrms_user", JSON.stringify(data.user));
//                 set({
//                     user: data.user,
//                     token,
//                 });
//             },

//             logout: () => {
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("hrms_token");
//                 localStorage.removeItem("hrms_user");
//                 sessionStorage.removeItem("token");
//                 localStorage.removeItem("hrms_rbac_enabled");
//                 set({
//                     user: null,
//                     token: null,
//                 });
//             },
//         }),
//         {
//             name: "auth-storage", // The key used in localStorage
//         }
//     )
// );

// export default useAuthStore;
import { create } from "zustand";

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("hrms_user") || "null");
    } catch {
        return null;
    }
};

const getStoredToken = () =>
    localStorage.getItem("hrms_token") || sessionStorage.getItem("hrms_token") ||
    localStorage.getItem("token") || sessionStorage.getItem("token");

const clearAuthStorage = () => {
    ["token", "hrms_token", "refreshToken", "hrms_refresh_token", "rememberMe"].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    localStorage.removeItem("hrms_user");
    sessionStorage.removeItem("hrms_user");
};

const useAuthStore = create((set) => ({
            user: getStoredUser(),
            token: getStoredToken(),

            setAuth: (data) => {
                const token = data?.accessToken || data?.token;

                set({
                    user: data?.user,
                    token,
                });
            },

            // Update logged-in user immediately without logout/login
            setUser: (user) => {
                if (user) localStorage.setItem("hrms_user", JSON.stringify(user));

                set({
                    user,
                });
            },

            logout: () => {
                clearAuthStorage();
                localStorage.removeItem("hrms_rbac_enabled");

                set({
                    user: null,
                    token: null,
                });
            },
        }));

export default useAuthStore;
