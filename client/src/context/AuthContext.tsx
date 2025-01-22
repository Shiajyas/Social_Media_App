import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isUserAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  setUserAuthenticated: (value: boolean) => void;
  setAdminAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(
    !!localStorage.getItem("userToken")
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    !!localStorage.getItem("adminToken")
  );

  const setUserAuthenticated = (value: boolean) => {
    setIsUserAuthenticated(value);
    if (value) {
      localStorage.setItem("userToken", "dummyToken"); // Replace with actual token
    } else {
      localStorage.removeItem("userToken");
    }
  };

  const setAdminAuthenticated = (value: boolean) => {
    setIsAdminAuthenticated(value);
    if (value) {
      localStorage.setItem("adminToken", "dummyAdminToken"); // Replace with actual token
    } else {
      localStorage.removeItem("adminToken");
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setIsUserAuthenticated(!!localStorage.getItem("userToken"));
      setIsAdminAuthenticated(!!localStorage.getItem("adminToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isUserAuthenticated,
        isAdminAuthenticated,
        setUserAuthenticated,
        setAdminAuthenticated,
      }}
    >
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
