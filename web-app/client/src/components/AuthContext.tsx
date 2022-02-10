import React, { createContext, useState } from "react";
import { user } from "../types";

type AuthContextType = {
  user: user | undefined;
  isSignUpShown: boolean;
  setIsSignUpShown: React.Dispatch<React.SetStateAction<boolean>>;
  isFeedbackShown: boolean;
  setIsFeedbackShown: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<user>();
  // setUser({
  //   name: "Kirill Stupakov",
  //   email: "kirill.stupakov.0@gmail.com",
  //   isAdmin: false,
  // });
  const [isSignUpShown, setIsSignUpShown] = useState(false);
  const [isFeedbackShown, setIsFeedbackShown] = useState(false);

  const outValue = {
    user,
    isSignUpShown,
    setIsSignUpShown,
    isFeedbackShown,
    setIsFeedbackShown,
  };

  return (
    <AuthContext.Provider value={outValue}>{children}</AuthContext.Provider>
  );
};
