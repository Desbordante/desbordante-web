import { gql } from "@apollo/client";

export const CHANGE_PASSWORD = gql`
  mutation changePassword(
    $currentPwdHash: String
    $newPwdHash: String!
    $email: String
  ) {
    changePassword(
      currentPwdHash: $currentPwdHash
      newPwdHash: $newPwdHash
      email: $email
    ) {
      __typename
      ... on TokenPair {
        accessToken
        refreshToken
      }
    }
  }
`;
