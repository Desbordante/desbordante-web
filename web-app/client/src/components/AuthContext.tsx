import { useLazyQuery, useQuery } from "@apollo/client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import parseUserPermissions from "../functions/parseUserPermissions";
import setupDeviceInfo from "../functions/setupDeviceInfo";
import { GET_ANONYMOUS_PERMISSIONS } from "../graphql/operations/queries/getAnonymousPermissions";
import { GET_USER } from "../graphql/operations/queries/getUser";
import { getAnonymousPermissions } from "../graphql/operations/queries/__generated__/getAnonymousPermissions";
import {
  getUser,
  getUserVariables,
} from "../graphql/operations/queries/__generated__/getUser";
import { user } from "../types/types";
import { ErrorContext } from "./ErrorContext";

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
  const { showError } = useContext(ErrorContext)!;
  const [user, setUser] = useState<user>();

  const [getUser] = useLazyQuery<getUser, getUserVariables>(GET_USER);
  const [getAnonymousPermissions] = useLazyQuery<getAnonymousPermissions>(
    GET_ANONYMOUS_PERMISSIONS
  );

  useEffect(() => {
    setupDeviceInfo();

    const userID = localStorage.getItem("userID");
    (async () => {
      const authUser = userID
        ? await getUser({
            variables: {
              userID,
            },
          })
        : null;
      if (authUser?.data?.user) {
        console.log("Found user: ", authUser.data?.user);
      } else {
        const permissions = (await getAnonymousPermissions()).data
          ?.getAnonymousPermissions;
        console.log("Anonymous permissions: ", permissions);

        if (permissions) {
          setUser({
            permissions: parseUserPermissions(permissions),
          });
        } else {
          showError({ message: "Could not load permissions" });
        }
      }
    })();
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
