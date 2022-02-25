import { gql } from "@apollo/client";

export const GET_USER = gql`
  query getUser($userID: ID!) {
    user(userID: $userID) {
      fullName
      email
      roles {
        type
        permissions
      }
    }
  }
`;
