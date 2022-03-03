import { gql } from "@apollo/client";

export const GET_ALGORITHMS_CONFIG = gql`
  query getAlgorithmsConfig {
    algorithmsConfig {
      allowedDatasets {
        tableInfo {
          ID
          fileName
          hasHeader
          delimiter
        }
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
      fileConfig {
        allowedFileFormats
        allowedDelimiters
        maxFileSize
      }
    }
  }
`;
