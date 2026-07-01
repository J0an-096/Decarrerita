import { createContext, useContext, useState, type ReactNode } from 'react';

// Definimos qué datos va a guardar nuestro estado global
interface AuthContextType {
  token: string | null;
  rol: string | null;
  login: (newToken: string, newRol: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Al arrancar, buscamos si ya había un token guardado de una sesión anterior
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [rol, setRol] = useState<string | null>(localStorage.getItem('rol'));

  // Función que llamaremos cuando el backend responda "200 OK" en el login
  const login = (newToken: string, newRol: string) => {
    setToken(newToken);
    setRol(newRol);
    localStorage.setItem('token', newToken);
    localStorage.setItem('rol', newRol);
  };

  // Función para cerrar sesión
  const logout = () => {
    setToken(null);
    setRol(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  };

  return (
    <AuthContext.Provider value={{ token, rol, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para que tus compañeros usen la seguridad fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};