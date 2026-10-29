import { createContext, useContext, useEffect, useState } from "react";
import { saveToken, getToken, deleteToken } from "../utils/securestore";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const savedToken = await getToken();

        console.log("token found:", savedToken ? "yes" : "no");

        setToken(savedToken);
      } catch (error) {
        console.error("Failed to load token:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadToken();
  }, []);

  async function login(newToken) {
    try {
      await saveToken(newToken);
      console.log("token saved: yes");
      setToken(newToken);
    } catch (error) {
      console.error("Failed to save token:", error);
      throw error;
    }
  }
  async function logout() {
    try {
      await deleteToken();

      const savedToken = await getToken();
      console.log("token found after logout:", savedToken ? "yes" : "no");

      setToken(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AppContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
