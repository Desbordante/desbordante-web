import React, { createContext, useState, useEffect } from "react";
import { user } from "../types";
import generateDeviceInfo from "../functions/generateDeviceInfo";

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
    // setUser({
    //   name: "Kirill Stupakov",
    //   email: "kirill.stupakov.0@gmail.com",
    //   canChooseTask: true,
    //   canUploadFiles: true,
    //   canViewAdminInfo: true,
    //   canManageUserSessions: true,
    // });
    if (!localStorage.getItem("deviceInfo") || !localStorage.getItem("deviceID")) {
      const { deviceID, deviceInfoBase64 } = generateDeviceInfo();
      localStorage.setItem("deviceID", deviceID);
      localStorage.setItem("deviceInfo", deviceInfoBase64);
    }
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
