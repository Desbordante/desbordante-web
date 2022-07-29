import { gql } from "@apollo/client";

export const ISSUE_VERIFICATION_CODE = gql`
  mutation issueVerificationCode {
    issueVerificationCode {
      message
    }
  }
`;
