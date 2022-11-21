import { gql } from '@apollo/client';

export const APPROVE_RECOVERY_CODE = gql`
  mutation approveRecoveryCode($email: String!, $codeValue: Int!) {
    approveRecoveryCode(email: $email, codeValue: $codeValue) {
      message
    }
  }
`;
