import { gql } from "apollo-server-core";
import { Session } from "../../db/models/Authorization/Session";
import { getAllAccountStatus } from "../../db/models/Authorization/User";

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
    
    type Feedback {
        feedbackID: String!
        userID: String
        user: User
        rating: Int!
        subject: String
        text: String!
    }
    
    type Role {
        type: String!
        permissions: [String!]
    }
    
    type User {
        userID: String!
        feedbacks: [Feedback!]
        roles: [Role!]
        permissions: [PermissionType!]
        fullName: String!
        email: String!
        country: String!
        companyOrAffiliation: String!
        occupation: String!
        accountStatus: String!
        tasks: [TaskInfo!]
        datasets: [DatasetInfo!]
    }
    
    enum AccountStatusType {
        EMAIL_VERIFICATION
        EMAIL_VERIFIED
    }
    
    enum SessionStatusType {
        VALID
        INVALID
    }
    
    type Session {
        sessionID: String!
        userID: String!
        user: User!
        deviceID: String!
        status: SessionStatusType!
        accessTokenIat: Int
        refreshTokenIat: Int
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
        allowedDatasets: [DatasetInfo!]!
        allowedCFDAlgorithms: [CFDAlgorithmConfig!]!
    }
    
    enum PrimitiveType {
        FD, CFD, AR 
    }
    
    type TaskState {
        taskID: ID!
        isPrivate: Boolean!
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
        type: PrimitiveType!
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
        taskID: String!
        state: TaskState!
        data: TaskData
        dataset: DatasetInfo!
    }
    enum PermissionType {
        USE_BUILTIN_DATASETS, USE_OWN_DATASETS, USE_USERS_DATASETS,
        VIEW_ADMIN_INFO,
        MANAGE_USERS_SESSIONS, MANAGE_APP_CONFIG
    }
    
    union TaskInfoAnswer = TaskInfo | TaskNotFoundError
    
    type Snippet {
        header: [String!]!
        rows: [[String!]!]
        datasetInfo: DatasetInfo!
    }
    
    input DatasetsQueryProps {
        includeBuiltInDatasets: Boolean = true
        includeDeletedDatasets: Boolean = false
        offset: Int! = 1
        limit: Int! = 10
    }
    
    input TasksInfoFilter {
        includeExecutedTasks: Boolean = true
        includeCurrentTasks: Boolean = true
        includeTasksWithError: Boolean = true
        includeTasksWithoutError: Boolean = true
    }
    
    type DatasetInfo {
        fileID: String!
        tableInfo: TableInfo!
        snippet(offset: Int!, limit: Int!): Snippet!
        tasks(filter: TasksInfoFilter!): [TaskInfo!]
    }
    
    type Query {
        algorithmsConfig: AlgorithmsConfig!
        """
        This query allows admin with permission "VIEW_ADMIN_INFO" see users feedbacks
        Throws an error if limit <= 0 or limit > 100 offset < 0 
        """
        feedbacks(limit: Int! = 10, offset: Int! = 0): [Feedback!]
        """
        When user isn't authorized, he must get permissions for anonymous user.
        If user logged in, he must extract permission from access token.
        ***
        Tasks, created by anonymous, can't be private
        """
        getAnonymousPermissions: [PermissionType!]!
        
        """
        Query for admins with permission "VIEW_ADMIN_INFO"
        """
        datasets(props: DatasetsQueryProps!): [DatasetInfo!]
        """
        All user can see built in dataset
        Authorized users can see their dataset
        Users with permission "VIEW_ADMIN_INFO" can see all dataset
        """
        datasetInfo(fileID: ID!): DatasetInfo
        """
        User can see results if one of the conditions is met:
        1) Task was created by anonymous
        2) Task was created by this user
        3) Task isn't private
        4) User has permission "VIEW_ADMIN_INFO"
        """
        taskInfo(taskID: ID!): TaskInfo!
        user(userID: ID!): User
        """
        Query for admins with permission "VIEW_ADMIN_INFO"
        """
        users(limit: Int! = 10 offset: Int! = 0): [User!]!
        """
        Query for admins with permission "VIEW_ADMIN_INFO"
        """
        sessions(limit: Int! = 10 offset: Int! = 0 onlyValid: Boolean! = true): [Session]!
    }
    
    input FileProps {
        delimiter: String!
        hasHeader: Boolean!
    }
    
    
    type DeleteTaskAnswer {
        message: String!
    }
    
    input CreatingUserProps {
        fullName: String!
        email: String!
        pwdHash: String!
        country: String!
        companyOrAffiliation: String!
        occupation: String!
    }
    
    type CreateUserAnswer {
        message: String!
        tokens: TokenPair!
    }
    
    type IssueVerificationCodeAnswer {
        message: String!
    }
    
    type TokenPair {
        refreshToken: String!
        accessToken: String!
    }
    
    input IntersectionTaskProps {
        algorithmName: String!
        type: PrimitiveType!
        errorThreshold: Float
        maxLHS: Int
        threadsCount: Int
        minSupport: Int
        minConfidence: Float
    }
    
    type Mutation {
        """
        After creating new account user will have anonymous permissions;
        """
        createUser(props: CreatingUserProps!): CreateUserAnswer!
        
        """
        Code for email approving is temporary (24 hours, destroys after first attempt).
        User must be logged in account and have account status Email Verification.
        Returns new token pair.
        """
        approveUserEmail(codeValue: Int!): TokenPair!
        
        """
        This query issues (or reissues) new verification code.
        Previous code will be destroyed.
        """
        issueVerificationCode: IssueVerificationCodeAnswer!
        
        """
        User can be logged in to multiple accounts at once.
        Client must pass password hash in params (not password!).
        If user's email wasn't approved, he will not be able to log in.
        """
        logIn(email: String!, pwdHash: String!): TokenPair!
        
        """
        If user wants to close all session, he must pass option allSession with value true.
        By default, only current session will be closed.
        If the request throws an error, then the user wasn't logged out of the account (session still valid)
        """
        logOut(allSessions: Boolean! = false): String!
        
        """
        When user's access token expired, client must send request fir refreshToken.
        If access token is already expired, you mustn't set header authorization with accessToken.
        Otherwise you will see error with code 401.
        """
        refresh(refreshToken: String!): TokenPair!
        
        """
        Creates feedback for user and saves information to the database.
        Administrators (with permission "VIEW_ADMIN_INFO") can see feedbacks
        """
        createFeedback(rating: Int!, subject: String, text: String!): Feedback!
        
        """
        This query allows authorized users upload datasets.
        User can choose his own datasets (pass fileID) in query createTaskWithDatasetChoosing.
        """
        uploadDataset(datasetProps: FileProps!, table: Upload!): DatasetInfo!
        
        """
        This query supports several restrictions:
        1) Anonymous (with permission "USE_BUILTIN_DATASETS") can only choose built in dataset
        2) Authorized user (with permission "USE_OWN_DATASETS") can also choose his uploaded datasets
        3) Administrators (with permission "USE_USERS_DATASETS") can use all datasets
        ***
        By default, the result of the algorithm is visible for all users.
        """
        createTaskWithDatasetChoosing(props: IntersectionTaskProps!, fileID: ID!): TaskInfo!
        """
        This query allows clients (with permission USE_OWN_DATASETS) upload dataset and create task.
        ***
        By default, the result of the algorithm is visible for all users.
        """
        createTaskWithDatasetUploading(props: IntersectionTaskProps!, datasetProps: FileProps!, table: Upload!): TaskInfo!
        
        """
        This query allows admin with permission "MANAGE_APP_CONFIG" change dataset property "isBuiltIn".
        """
        setDatasetBuiltInStatus(fileID: String!, isBuiltIn: Boolean!): DatasetInfo!
        
        """
        Soft delete. Users can delete own tasks. Administrators can delete task of any user.
        """
        deleteTask(taskID: ID!): DeleteTaskAnswer!
        
        """
        By default, task's result is public. (Only authorized people can look results)
        This query allows client to set task privacy.
        """
        changeTaskResultsPrivacy(taskID: String!, isPrivate: Boolean!): TaskInfo!
        
        
    }
`;

export = typeDefs;
