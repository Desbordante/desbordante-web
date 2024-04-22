import { gql } from '@apollo/client';

export const GET_ALGORITHMS_CONFIG = gql`
  query getAlgorithmsConfig {
    algorithmsConfig {
      allowedDatasets {
        fileID
        fileName
        hasHeader
        delimiter
        supportedPrimitives
        rowsCount
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
      allowedFDAlgorithms {
        name
        properties {
          hasArityConstraint
          hasErrorThreshold
          isMultiThreaded
        }
      }
      allowedCFDAlgorithms {
        name
        properties {
          hasArityConstraint
          hasConfidence
          hasSupport
        }
      }
      allowedARAlgorithms {
        name
        properties {
          hasConfidence
          hasSupport
        }
      }
      fileConfig {
        allowedFileFormats
        allowedDelimiters
        userDiskLimit
      }
    }
  }
`;
