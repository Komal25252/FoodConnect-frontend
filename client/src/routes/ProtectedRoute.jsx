import React from "react";
import { Navigate } from "react-router-dom";

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
};

export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token || !user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
