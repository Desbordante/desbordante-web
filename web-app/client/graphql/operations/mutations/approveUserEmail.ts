import { gql } from "@apollo/client";

export const APPROVE_USER_EMAIL = gql`
  mutation approveUserEmail($codeValue: Int!) {
    approveUserEmail(codeValue: $codeValue) {
      refreshToken
      accessToken
    }
  }
`;
