import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loginApi, refreshTokenApi, type User, type AuthTokens } from "~/services/auth";

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage on mount
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    try {
      const storedUser = localStorage.getItem("user");
      const storedTokens = localStorage.getItem("tokens");
      if (storedUser && storedTokens) {
        setUser(JSON.parse(storedUser));
        setTokens(JSON.parse(storedTokens));
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("tokens");
      localStorage.removeItem("token");
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    
    // Check multiple potential token fields to ensure compatibility
    const token = (res as any).accessToken || (res as any).token || (res as any).jwt;
    
    if (!token) {
      console.error("Login failed: Authentication token was not received from the backend.", res);
      throw new Error("Authentication token missing in server response.");
    }

    const authTokens: AuthTokens = {
      accessToken: token,
      refreshToken: res.refreshToken || "",
    };

    // Store in global state
    setUser(res.user);
    setTokens(authTokens);
    
    // Store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(res.user));
    localStorage.setItem("tokens", JSON.stringify(authTokens));
    localStorage.setItem("token", token); // Important for api.ts interceptor

    // Debug log to verify storage
    console.log("Token saved successfully:", localStorage.getItem("token"));
  }, []);

  const logout = useCallback(() => {
    // Clear state
    setUser(null);
    setTokens(null);
    
    // Clear storage
    localStorage.removeItem("user");
    localStorage.removeItem("tokens");
    localStorage.removeItem("token");
    
    console.log("Authentication cleared (Logged out).");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!tokens?.accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
