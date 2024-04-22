import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation updateUser($props: UpdatingUserProps!) {
    updateUser(props: $props) {
      message
    }
  }
`;
