import { gql } from "@apollo/client";

export const GET_USER = gql`
  query getUser($userID: ID!) {
    user(userID: $userID) {
      userID
      fullName
      email
      permissions
      accountStatus
      datasets {
        fileID
        fileName
        hasHeader
        delimiter
        supportedPrimitives
        rowsCount
        countOfColumns
        isBuiltIn
      }
    }
  }
`;
