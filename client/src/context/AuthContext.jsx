/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser());

  const syncAuth = (payload) => {
    localStorage.setItem("token", payload.token);
    const safeUser = {
      _id: payload._id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      resumeUrl: payload.resumeUrl || "",
      savedJobs: payload.savedJobs || [],
    };
    localStorage.setItem("user", JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    syncAuth(data);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    syncAuth(data);
    return data;
  };

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (patch) => {
    if (!user) return;
    const next = { ...user, ...patch };
    localStorage.setItem("user", JSON.stringify(next));
    setUser(next);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
