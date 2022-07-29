import { gql } from "@apollo/client";

export const LOG_IN = gql`
  mutation logIn($email: String!, $pwdHash: String!) {
    logIn(email: $email, pwdHash: $pwdHash) {
      accessToken
      refreshToken
    }
  }
`;
