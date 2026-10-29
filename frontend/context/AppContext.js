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
    await saveToken(newToken);
    setToken(newToken);
  }

  async function logout() {
    await deleteToken();
    setToken(null);
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
