import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./components/auth/RegisterPage";
import OtpVerification from "./components/auth/VerifyOtpPage";
import Home from "./pages/User/Home";
import { ToastContainer } from "react-toastify";
import { useAuthContext } from "./context/AuthContext";
import ForgotPasswordPage from "./components/ForgetPwd";
import { UserLoginPage } from "./pages/User/UserLoginPage";
import AdminLoginPage from "./pages/Admin/AdminLoginPage";
import AdminDashBord from "./pages/Admin/DashBord";

const App = () => {
  const { isAdminAuthenticated, isUserAuthenticated } = useAuthContext();

  // Private Route Component
  const UserPrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isUserAuthenticated ? (
      <>{children}</>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  const AdminPrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAdminAuthenticated ? (
      <>{children}</>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        {/* Private Routes */}
        <Route
          path="/home"
          element={
            <UserPrivateRoute>
              <Home />
            </UserPrivateRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminPrivateRoute>
              <AdminDashBord />
            </AdminPrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path="*" element={<Navigate to={ isUserAuthenticated ? "/home" : isAdminAuthenticated ? "/admin/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
};

export default App;
