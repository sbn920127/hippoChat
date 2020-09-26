import React, { useEffect, useState } from "react";
import { auth } from "./firebaseAPI";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [padding, setPending] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setPending(false);
    })
  }, []);

  if (padding) {
    return <>Loading...</>
  }

  return (
    <AuthContext.Provider
      value={{ currentUser }}
    >
      {children}
    </AuthContext.Provider>
  )
};
