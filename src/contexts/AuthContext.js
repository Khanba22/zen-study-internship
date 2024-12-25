"use client";

import React, { createContext, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const login = async ({ username, password }) => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth({
          isAuthenticated: true,
          user: data.user,
          token: data.token,
        });
        router.push("/admin/dashboard");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
