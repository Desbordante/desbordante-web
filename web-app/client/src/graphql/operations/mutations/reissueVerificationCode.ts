import { gql } from "@apollo/client";

export const REISSUE_VERIFICATION_CODE = gql`
  mutation reissueVerificationCode($userID: String!) {
    reissueVerificationCode(userID: $userID) {
      message
      userID
    }
  }
`;
