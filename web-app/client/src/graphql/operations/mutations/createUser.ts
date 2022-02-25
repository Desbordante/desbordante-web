import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation createUser($props: CreatingUserProps!) {
    createUser(props: $props) {
      message
      userID
    }
  }
`;
