import { useLazyQuery, useMutation } from '@apollo/client';
import jwtDecode from 'jwt-decode';
import React, {
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  FC,
  useCallback,
} from 'react';
import {
  logOut,
  logOutVariables,
} from '@graphql/operations/mutations/__generated__/logOut';
import { LOG_OUT } from '@graphql/operations/mutations/logOut';
import { getAnonymousPermissions } from '@graphql/operations/queries/__generated__/getAnonymousPermissions';
import { getUser } from '@graphql/operations/queries/__generated__/getUser';
import { GET_ANONYMOUS_PERMISSIONS } from '@graphql/operations/queries/getAnonymousPermissions';
import { GET_USER } from '@graphql/operations/queries/getUser';
import parseUserPermissions from '@utils/parseUserPermissions';
import setupDeviceInfo from '@utils/setupDeviceInfo';
import { showError } from '@utils/toasts';
import { removeTokenPair, saveTokenPair } from '@utils/tokens';
import { DecodedToken, TokenPair, User } from 'types/auth';

type AuthContextType = {
  user: User | undefined | null;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  isSignUpShown: boolean;
  setIsSignUpShown: React.Dispatch<React.SetStateAction<boolean>>;
  isFeedbackShown: boolean;
  setIsFeedbackShown: React.Dispatch<React.SetStateAction<boolean>>;
  isLogInShown: boolean;
  setIsLogInShown: React.Dispatch<React.SetStateAction<boolean>>;
  signOut: () => void;
  applyTokens: (tokens: TokenPair) => void;
  refreshUserData: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | undefined | null>();

  const [getUser] = useLazyQuery<getUser>(GET_USER);
  const [getAnonymousPermissions] = useLazyQuery<getAnonymousPermissions>(
    GET_ANONYMOUS_PERMISSIONS,
  );
  const [logOut] = useMutation<logOut, logOutVariables>(LOG_OUT, {
    variables: {
      allSessions: true,
    },
  });

  const removeUser = () => {
    localStorage.removeItem('user');
    removeTokenPair();
    setUser(null);
  };

  const signOut = async () => {
    const response = await logOut();
    if (response.data) {
      removeUser();
    }
  };

  const applyTokens = (tokens: TokenPair) => {
    saveTokenPair(tokens);
    const data = jwtDecode(tokens.accessToken) as DecodedToken;
    setUser({
      id: data.userID,
      name: data.fullName,
      email: data.email,
      isVerified: data.accountStatus === 'EMAIL_VERIFIED',
      permissions: parseUserPermissions(data.permissions),
      datasets: [],
    });
  };

  const refreshUserData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    const response = await getUser({
      fetchPolicy: 'network-only',
    });

    if (response.data?.user) {
      const { userID, fullName, email, accountStatus, permissions, datasets } =
        response.data.user;
      setUser({
        id: userID,
        name: fullName,
        email,
        isVerified: accountStatus === 'EMAIL_VERIFIED',
        permissions: parseUserPermissions(permissions),
        datasets: datasets.data || [],
      });
    } else {
      showError('Your authentication expired.', 'Please, log in again.');
      removeUser();
    }
  }, [getUser, user?.id]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

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
                anonymousPermissions.data!.getAnonymousPermissions,
              ),
              datasets: [],
            }));
          }
        })();
      } catch (error) {
        if (error instanceof Error) {
          showError(error.message);
        }
      }
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [getAnonymousPermissions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
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
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={outValue}>{children}</AuthContext.Provider>
  );
};
