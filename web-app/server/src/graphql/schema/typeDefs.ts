import { gql } from "apollo-server-core";

const typeDefs = gql`
    
    type AlgorithmProps {
        hasErrorThreshold: Boolean!
        hasArityConstraint: Boolean!
        isMiltithreaded: Boolean!
    }
    
    type FDAlgorithmProps {
        baseProperties: AlgorithmProps!
    }
    
    type CFDAlgorithmProps {
        baseProperties: AlgorithmProps!
        hasConfidenceThreshold: Boolean!
    }
    
    type FDAlgorithmConfig {
        name: String!
        properties: FDAlgorithmProps!
    }
    
    type InputFileConfig {
        allowedFileFormats: [String]!
        allowedSeparators: [String]!
        maxFileSize: Int!
    }
    
    type InputDatasetConfig {
        name: String!
        delimiter: String!
        hasHeader: Boolean!
    }
    
    type AlgorithmsConfig {
        fileConfig: InputFileConfig!
        allowedFDAlgorithms: [FDAlgorithmConfig]!
        allowedFDDatasets: [InputDatasetConfig]!
        allowedCFDAlgorithms: [CFDAlgorithmProps]
        allowedCFDDatasets: [InputDatasetConfig]!
    }
    
    type TaskStatus {
        phaseName: String!
        progress: Float!
        currentPhase: Int!
        msg: String!
    }
    
    type BaseTaskInfo {
        ID: ID!
        status: TaskStatus
        fileName: String!
        algorithmName: String!
        errorThreshold: Float
    }
    
    type Column {
        name: String!
        index: Int!
    }
    
    type FD {
        lhs: [Column]!
        rhs: Column!
    }
    
    type CFD {
        fd: FD!
        lhsPatterns: [String]!
        rhsPattern: String!
    }
    
    type BaseAlgResInfo {
        taskInfo: BaseTaskInfo
        tableHeader: [String]!
        elapsedTime: Int
    }

    type TaskNotFoundError {
        msg: String!
    }

    union TaskInfoResult = BaseTaskInfo | TaskNotFoundError

    type FDAlgorithm {
        baseInfo: BaseAlgResInfo!
        discoveredFDs: [FD]!
        primaryKeys: [Column]!
    }

    type CFDAlgorithm {
        baseInfo: BaseAlgResInfo!
        discoveredFDs: [CFD]!
    }
    
    union FDAResult = FDAlgorithm | TaskNotFoundError
#    union CFDAResult = CFDAlgorithm | TaskNotFoundError
    
    type Query {
        algorithmsConfig: AlgorithmsConfig
        taskInfo(id: ID!): TaskInfoResult
        FDAResult(id: ID!): FDAResult
#        CFDAlgorithmResult(id: ID!): CFDAResult
        numberSix: Int!
        numberSeven: Int!
    }
`;

export = typeDefs;
