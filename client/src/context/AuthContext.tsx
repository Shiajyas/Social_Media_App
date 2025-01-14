import { createContext, useContext } from "react";

interface AuthContextType {
  isUserAuthenticated: boolean;
  isAdminAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Derive authentication states directly from localStorage
  const isUserAuthenticated = !!localStorage.getItem("userToken");
  const isAdminAuthenticated = !!localStorage.getItem("adminToken");

  return (
    <AuthContext.Provider value={{ isUserAuthenticated, isAdminAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
