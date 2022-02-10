import { gql } from "apollo-server-core";

const typeDefs = gql`

    scalar Upload

    type TableInfo {
        ID: ID!
        userID: ID
        isBuiltIn: Boolean!
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
        tasks: [TaskInfo!]
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
        allowedFileFormats: [String!]!
        allowedDelimiters: [String!]!
        maxFileSize: Float!
    }
    
    type AlgorithmsConfig {
        fileConfig: InputFileConfig!
        allowedFDAlgorithms: [FDAlgorithmConfig!]!
        allowedDatasets: [DatasetInfo!]! # TODO CHECK
        allowedCFDAlgorithms: [CFDAlgorithmConfig!]!
    }
    
    enum TaskType {
        FDA, CFDA
    }
    
    type TaskState {
        taskID: ID!
        attemptNumber: Int!
        status: String!
        phaseName: String
        currentPhase: Int
        progress: Float!
        maxPhase: Int
        errorMsg: String
        isExecuted: Boolean!
        elapsedTime: Float
    }
    
    type BaseTaskConfig {
        algorithmName: String!
        type: TaskType!
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
        lhs: [Int!]! #[Column]!
        rhs: Int! #Column!
    }
    
    type CFD {
        fd: FD!
        lhsPatterns: [String!]!
        rhsPattern: String!
    }

    type TaskNotFoundError {
        msg: String!
    }
    
    type UnauthorizedError {
        msg: String!
    }

    type FDPieChartRow {
        column: Column!
        value: Float!
    }
    
    type FDPieChart {
        lhs: [FDPieChartRow]
        rhs: [FDPieChartRow]
    }

    type CFDPieChartRow {
        column: Column!
        pattern: String
        value: Float!
    }
    
    type FDResult {
        FDs: [FD]
        PKs: [Column]
        pieChartData: FDPieChart
    }
    
    type CFDResult {
        CFDs: [CFD]
        PKs: [Column]
        pieChartData: [CFDPieChartRow]
    }
    
    type FDTask {
        config: FDTaskConfig
        result: FDResult
    }
    
    type CFDTask {
        config: CFDTaskConfig
        result: CFDResult
    }
    
    union TaskData = FDTask | CFDTask
    
    type TaskInfo {
        state: TaskState!
        data: TaskData
        dataset: DatasetInfo!
    }
    
    union TaskInfoAnswer = TaskInfo | TaskNotFoundError
    
    type Snippet {
        header: [String]!
        rows: [[String!]!]
        datasetInfo: DatasetInfo!
    }
    
    input DatasetsQueryProps {
        includeBuiltInDatasets: Boolean = true
        includeDeletedDatasets: Boolean = false
        offset: Int = 1
        limit: Int = 10
    }
    
    input TasksInfoFilter {
        includeExecutedTasks: Boolean = true
        includeCurrentTasks: Boolean = true
        includeTasksWithError: Boolean = true
        includeTasksWithoutError: Boolean = true
    }
    
    type DatasetInfo {
        tableInfo: TableInfo!
        snippet(offset: Int!, limit: Int!): Snippet!
        tasks(filter: TasksInfoFilter!): [TaskInfo!]
    }
    
    type Query {
        algorithmsConfig: AlgorithmsConfig!
        datasets(props: DatasetsQueryProps!): [DatasetInfo!]
        datasetInfo(fileID: ID!): DatasetInfo
        taskInfo(id: ID!): TaskInfo!
        user(id: ID!): User
    }
    
    input FDTaskProps {
        algorithmName: String!
        errorThreshold: Float!
        maxLHS: Int = -1
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
    
    type DeleteTaskAnswer {
        message: String!
    }
    
    type Mutation {
        chooseFDTask(props: FDTaskProps!, fileID: ID!): TaskInfo!
        deleteTask(taskID: ID!): DeleteTaskAnswer!
        # chooseCFDTask(props: CFDTaskProps!, fileID: ID!): TaskInfo!
        createFDTask(props: FDTaskProps!, datasetProps: FileProps!, table: Upload!): TaskInfo!
        # createCFDTask(props: CFDTaskProps!, fileProps: FileProps!, table: Upload!): TaskInfo!
    }
`;

export = typeDefs;
