import { gql } from "@apollo/client";

export const APPROVE_USER_EMAIL = gql`
  mutation approveUserEmail($codeValue: Int!, $userID: String!) {
    approveUserEmail(codeValue: $codeValue, userID: $userID) {
      refreshToken
      accessToken
    }
  }
`;
