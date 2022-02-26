import { useLazyQuery, useMutation } from "@apollo/client";
import jwtDecode from "jwt-decode";
import React, { createContext, useState, useEffect, useContext } from "react";

import {
  getRefreshToken,
  removeTokenPair,
  saveTokenPair,
} from "../functions/authTokens";
import parseUserPermissions from "../functions/parseUserPermissions";
import setupDeviceInfo from "../functions/setupDeviceInfo";
import { LOG_OUT } from "../graphql/operations/mutations/logOut";
import { REFRESH } from "../graphql/operations/mutations/refresh";
import {
  logOut,
  logOutVariables,
} from "../graphql/operations/mutations/__generated__/logOut";
import {
  refresh,
  refreshVariables,
} from "../graphql/operations/mutations/__generated__/refresh";
import { GET_ANONYMOUS_PERMISSIONS } from "../graphql/operations/queries/getAnonymousPermissions";
import { GET_USER } from "../graphql/operations/queries/getUser";
import { getAnonymousPermissions } from "../graphql/operations/queries/__generated__/getAnonymousPermissions";
import {
  getUser,
  getUserVariables,
} from "../graphql/operations/queries/__generated__/getUser";
import { DecodedToken, TokenPair, User } from "../types/types";
import { ErrorContext } from "./ErrorContext";

type AuthContextType = {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  isSignUpShown: boolean;
  setIsSignUpShown: React.Dispatch<React.SetStateAction<boolean>>;
  isFeedbackShown: boolean;
  setIsFeedbackShown: React.Dispatch<React.SetStateAction<boolean>>;
  isLogInShown: boolean;
  setIsLogInShown: React.Dispatch<React.SetStateAction<boolean>>;
  signOut: () => void;
  applyTokens: (tokens: TokenPair) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: React.FC = ({ children }) => {
  const { showError } = useContext(ErrorContext)!;
  const [user, setUser] = useState<User | undefined>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : undefined
  );

  const [getUser] = useLazyQuery<getUser, getUserVariables>(GET_USER);
  const [getAnonymousPermissions] = useLazyQuery<getAnonymousPermissions>(
    GET_ANONYMOUS_PERMISSIONS
  );
  const [logOut] = useMutation<logOut, logOutVariables>(LOG_OUT, {
    variables: {
      allSessions: true,
    },
  });
  const [refresh] = useMutation<refresh, refreshVariables>(REFRESH);

  const removeUser = () => {
    localStorage.removeItem("user");
    removeTokenPair();
    setUser(undefined);
  };

  const signOut = async () => {
    try {
      const response = await logOut();
      if (response.data) {
        removeUser();
      }
    } catch (error: any) {
      showError({ message: error?.message });
    }
  };

  const applyTokens = (tokens: TokenPair) => {
    saveTokenPair(tokens);
    const data = jwtDecode(tokens.accessToken) as DecodedToken;
    setUser({
      id: data.userID,
      name: data.fullName,
      email: data.email,
      isVerified: data.accountStatus === "EMAIL_VERIFIED",
      permissions: parseUserPermissions(data.permissions),
    });
  };

  const handleTokenExpiration = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const response = await refresh({
        variables: {
          refreshToken,
        },
      });

      if (response.errors) {
        showError({ message: response.errors[0].message });
        removeUser();
      } else if (response.data?.refresh) {
        applyTokens(response.data.refresh);
      }
    } else {
      showError({
        message: "Your authentication expired.",
        suggestion: "Please, log in again.",
      });
      removeUser();
    }
  };

  useEffect(() => {
    if (user?.id) {
      (async () => {
        const response = await getUser({
          variables: {
            userID: user.id!,
          },
        });
        if (response.data?.user) {
          const {userID, fullName, email, accountStatus, permissions} = response.data.user;
          setUser({
            id: userID,
            name: fullName,
            email,
            isVerified: accountStatus === "EMAIL_VERIFIED",
            permissions: parseUserPermissions(permissions),
          });
        } else {
          showError({
            message: "Your authentication expired.",
            suggestion: "Please, log in again.",
          });
          removeUser();
        }
      })();
    }
  }, []);

  useEffect(() => {
    setupDeviceInfo();

    if (!user || !user.isVerified) {
      try {
        (async () => {
          const anonymousPermissions = await getAnonymousPermissions();
          if (anonymousPermissions.data) {
            setUser((prevUser) => ({
              ...prevUser,
              permissions: parseUserPermissions(
                anonymousPermissions.data!.getAnonymousPermissions
              ),
            }));
          }
        })();
      } catch (error: any) {
        showError({ message: error.message });
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const [isSignUpShown, setIsSignUpShown] = useState(false);
  const [isLogInShown, setIsLogInShown] = useState(false);
  const [isFeedbackShown, setIsFeedbackShown] = useState(false);

  const outValue = {
    user,
    setUser,
    isSignUpShown,
    setIsSignUpShown,
    isFeedbackShown,
    setIsFeedbackShown,
    isLogInShown,
    setIsLogInShown,
    signOut,
    applyTokens,
  };

  return (
    <AuthContext.Provider value={outValue}>{children}</AuthContext.Provider>
  );
};
