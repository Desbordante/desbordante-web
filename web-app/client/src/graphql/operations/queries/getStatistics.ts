import { gql } from '@apollo/client';

export const GET_STATISTICS = gql`
  query getStatistics {
    statistics {
      space {
        used
        all
      }
      files {
        builtIn
        all
      }
      tasks {
        completed
        inProgress
        failed
        queued
      }
      users {
        active
        all
      }
    }
  }
`;
