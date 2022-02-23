import React, { createContext, useState, useEffect } from "react";
import { user } from "../types/types";
import generateDeviceId from "../functions/generateDeviceId";

type AuthContextType = {
  user: user | undefined;
  isSignUpShown: boolean;
  setIsSignUpShown: React.Dispatch<React.SetStateAction<boolean>>;
  isFeedbackShown: boolean;
  setIsFeedbackShown: React.Dispatch<React.SetStateAction<boolean>>;
  isLogInShown: boolean;
  setIsLogInShown: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<user>();
  useEffect(() => {
    setUser({
      name: "Kirill Stupakov",
      email: "kirill.stupakov.0@gmail.com",
      canChooseTask: true,
      canUploadFiles: true,
      canViewAdminInfo: true,
      canManageUserSessions: true,
    });

    localStorage.setItem("deviceId", generateDeviceId());
  }, []);
  const [isSignUpShown, setIsSignUpShown] = useState(false);
  const [isLogInShown, setIsLogInShown] = useState(false);
  const [isFeedbackShown, setIsFeedbackShown] = useState(false);

  const outValue = {
    user,
    isSignUpShown,
    setIsSignUpShown,
    isFeedbackShown,
    setIsFeedbackShown,
    isLogInShown,
    setIsLogInShown,
  };

  return (
    <AuthContext.Provider value={outValue}>{children}</AuthContext.Provider>
  );
};
