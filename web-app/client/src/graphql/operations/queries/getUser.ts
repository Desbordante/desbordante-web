import { gql } from '@apollo/client';

export const GET_USER = gql`
  query getUser {
    user {
      userID
      fullName
      email
      permissions
      accountStatus
      country
      companyOrAffiliation
      occupation
      reservedDiskSpace
      remainingDiskSpace
      tasks(
        props: { ordering: { parameter: CREATION_TIME, direction: DESC } }
      ) {
        total
        data {
          taskID
          state {
            ... on TaskState {
              user {
                fullName
              }
              processStatus
              phaseName
              currentPhase
              progress
              maxPhase
              isExecuted
              elapsedTime
              createdAt
            }
          }
          data {
            baseConfig {
              algorithmName
              type
            }
          }
          dataset {
            originalFileName
          }
        }
      }
      datasets(props: { ordering: { parameter: FILE_SIZE, direction: DESC } }) {
        total
        data {
          fileID
          fileName
          hasHeader
          delimiter
          supportedPrimitives
          rowsCount
          fileSize
          fileFormat {
            inputFormat
            tidColumnIndex
            itemColumnIndex
            hasTid
          }
          countOfColumns
          isBuiltIn
          createdAt
          originalFileName
          numberOfUses
        }
      }
    }
  }
`;
