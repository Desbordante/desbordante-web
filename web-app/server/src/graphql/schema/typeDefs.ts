import { gql } from "apollo-server-core";

const typeDefs = gql`

    scalar Upload

    type Table {
        ID: ID!
        userID: ID
        isBuiltInDataset: Boolean!
        fileName: String!
        originalFileName: String!
        mimeType: String
        encoding: String
        hasHeader: Boolean!
        renamedHeader: String!
        path: String!
        delimiter: String!
    }
    
    type User {
        id: String!
        email: String!
        name: String!
        tasks: [TaskInfo]
    }
    
    type FDAlgorithmProps {
        hasErrorThreshold: Boolean!
        hasArityConstraint: Boolean!
        isMultiThreaded: Boolean!
    }
    
    type CFDAlgorithmProps {
        hasArityConstraint: Boolean!
        hasSupport: Boolean!
        hasConfidence: Boolean!
    }
    
    type FDAlgorithmConfig {
        name: String!
        properties: FDAlgorithmProps!
    }

    type CFDAlgorithmConfig {
        name: String!
        properties: CFDAlgorithmProps!
    }
    
    type InputFileConfig {
        allowedFileFormats: [String]!
        allowedSeparators: [String]!
        maxFileSize: Float
    }
    
    type AlgorithmsConfig {
        fileConfig: InputFileConfig!
        allowedFDAlgorithms: [FDAlgorithmConfig]!
        allowedDatasets: [Table]
        allowedCFDAlgorithms: [CFDAlgorithmConfig]!
    }
    
    enum TaskType {
        FDA, CFDA
    }
    
    type TaskInfo {
        taskID: ID!
        attemptNumber: Int!
        type: TaskType!
        status: String!
        phaseName: String
        currentPhase: Int
        progress: Float!
        maxPhase: Int
        errorMsg: String
        elapsedTime: Float
    }
    
    type BaseTaskConfig {
        algorithmName: String!
        table: Table!
    }
    
    type FDTaskConfig {
        baseConfig: BaseTaskConfig!
        errorThreshold: Float!
        maxLHS: Int
        threadsCount: Int!
    }
    
    type CFDTaskConfig {
        baseConfig: BaseTaskConfig!
        maxLHS: Int
        minSupport: Int
        minConfidence: Float
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

    type TaskNotFoundError {
        msg: String!
    }
    
    type InvalidInputError {
        msg: String!
    }
    
    type InternalServerError {
        msg: String!
    }
    
    type UnauthorizedError {
        msg: String!
    }

    type FDPieChartRow {
        column: Column!
        value: Float!
    }

    type CFDPieChartRow {
        column: Column!
        pattern: String
        value: Float!
    }
    
    type FDAResult {
        FDs: [FD]
        PKs: [Column]
        PieChartData: [FDPieChartRow]
    }
    
    type FDATaskInfo {
        info: TaskInfo
        config: FDTaskConfig
        result: FDAResult
    }

    type CFDAResult {
        CFDs: [CFD]
        PKs: [Column]
        PieChartData: [CFDPieChartRow]
    }
    
    type CFDATaskInfo {
        info: TaskInfo
        config: CFDTaskConfig # Add about file and snippet
        result: CFDAResult
    }
    
    type Snippet {
        header: [String]!
        rows: [[String]]
        table: Table
    }
    
    union TaskInfoAnswer = FDATaskInfo | CFDATaskInfo
    union TaskChoosingAnswer = TaskInfo
    union TaskCreatingAnswer = TaskInfo | UnauthorizedError | InvalidInputError | InternalServerError
    
    type Query {
        user(id: ID!): User
        snippet(taskID: ID!, from: Int!, limit: Int!): Snippet!
        algorithmsConfig: AlgorithmsConfig!
        taskInfo(id: ID!): TaskInfoAnswer!
    }
    
    input ChooseFDTaskProps {
        algorithmName: String!
        errorThreshold: Float!
        maxLHS: Int
        threadsCount: Int!
    }
    
    input FDTaskProps {
        algorithmName: String!
        errorThreshold: Float!
        maxLHS: Int
        threadsCount: Int!
    }
    
    input FileProps {
        delimiter: String!
        hasHeader: Boolean!
    }

    input CFDProps {
        algorithmName: String!
        maxLHS: Int
        minSupport: Int
        minConfidence: Float
    }
    
    type Mutation {
        chooseFDTask(algProps: FDTaskProps!, fileID: ID!): TaskInfo!
        # chooseCFDTask(props: CFDTaskProps!, fileID: ID!): TaskInfo!
        createFDTask(props: FDTaskProps!, fileProps: FileProps!, table: Upload!): TaskInfo!
        # createCFDTask(props: CFDTaskProps!, fileProps: FileProps!, table: Upload!): TaskInfo!
    }
`;

export = typeDefs;
