import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    if (token && role) {
      setUser({ token, role, name });
    }
  }, []);

  const login = (data) => {
    const role = data.user?.role || data.role;
    const name = data.user?.name || data.name || 'User';
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);
    setUser({ token: data.access_token, role, name });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
