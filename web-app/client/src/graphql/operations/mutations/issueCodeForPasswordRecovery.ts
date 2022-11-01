import { gql } from "@apollo/client";

export const ISSUE_CODE_FOR_PASSWORD_RECOVERY = gql`
  mutation issueCodeForPasswordRecovery($email: String!) {
    issueCodeForPasswordRecovery(email: $email) {
      message
    }
  }
`;
