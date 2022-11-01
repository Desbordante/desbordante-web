import { gql } from "@apollo/client";

export const LOG_OUT = gql`
  mutation logOut($allSessions: Boolean = true) {
    logOut(allSessions: $allSessions)
  }
`;
