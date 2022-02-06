import { gql } from "@apollo/client";

export const GET_ALGORITHMS_CONFIG = gql`
    query algorithmsConfig {
        algorithmsConfig {
            allowedDatasets {
                ID
                fileName
                hasHeader
                delimiter
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
                    hasConfidence
                    hasSupport
                }
            }
            fileConfig{
                allowedFileFormats
                allowedDelimiters
                maxFileSize
            }
        }
    }
`;
