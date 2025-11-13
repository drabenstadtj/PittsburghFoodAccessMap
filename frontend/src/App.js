import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Reports from "./pages/admin/Reports";
import Suggestions from "./pages/admin/Suggestions";
import AdminResources from "./pages/admin/Resources";
import Register from "./pages/admin/Register";
import MainApp from "./MainApp";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route - your existing app */}
          <Route path="/" element={<MainApp />} />
          
          {/* Admin login */}
          <Route path="/admin/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="resources" element={<AdminResources />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;