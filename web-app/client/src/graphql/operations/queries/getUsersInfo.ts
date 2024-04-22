import { gql } from '@apollo/client';

export const GET_USERS_INFO = gql`
  query getUsersInfo($props: UsersQueryProps!) {
    users(props: $props) {
      total
      data {
        userID
        createdAt
        fullName
        email
        country
        companyOrAffiliation
        occupation
      }
    }
  }
`;
