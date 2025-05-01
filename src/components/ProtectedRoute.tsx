
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // No longer checking for authentication
  return <>{children}</>;
};

export default ProtectedRoute;
