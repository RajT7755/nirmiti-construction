import { Navigate, Outlet, useLocation } from "react-router";
import { isLoggedIn } from "@/lib/session";
import { useAppDataContext } from "./AppDataContext";

export function RequireSession() {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireProject() {
  const { projects, loading } = useAppDataContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f7]">
        <span className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
}

export function RedirectRoot() {
  const { projects, loading } = useAppDataContext();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f7]">
        <span className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export function LoginGuard() {
  const { projects, loading } = useAppDataContext();

  if (!isLoggedIn()) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f7]">
        <span className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
