import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AlgorithmProps = {
  __typename?: 'AlgorithmProps';
  hasArityConstraint: Scalars['Boolean'];
  hasErrorThreshold: Scalars['Boolean'];
  isMiltithreaded: Scalars['Boolean'];
};

export type AlgorithmsConfig = {
  __typename?: 'AlgorithmsConfig';
  allowedCFDAlgorithms?: Maybe<Array<Maybe<CfdAlgorithmProps>>>;
  allowedCFDDatasets: Array<Maybe<InputDatasetConfig>>;
  allowedFDAlgorithms: Array<Maybe<FdAlgorithmConfig>>;
  allowedFDDatasets: Array<Maybe<InputDatasetConfig>>;
  fileConfig: InputFileConfig;
};

export type BaseAlgResInfo = {
  __typename?: 'BaseAlgResInfo';
  elapsedTime?: Maybe<Scalars['Int']>;
  tableHeader: Array<Maybe<Scalars['String']>>;
  taskInfo?: Maybe<BaseTaskInfo>;
};

export type BaseTaskInfo = {
  __typename?: 'BaseTaskInfo';
  ID: Scalars['ID'];
  algorithmName: Scalars['String'];
  errorThreshold?: Maybe<Scalars['Float']>;
  fileName: Scalars['String'];
  status?: Maybe<TaskStatus>;
};

export type Cfd = {
  __typename?: 'CFD';
  fd: Fd;
  lhsPatterns: Array<Maybe<Scalars['String']>>;
  rhsPattern: Scalars['String'];
};

export type CfdAlgorithm = {
  __typename?: 'CFDAlgorithm';
  baseInfo: BaseAlgResInfo;
  discoveredFDs: Array<Maybe<Cfd>>;
};

export type CfdAlgorithmProps = {
  __typename?: 'CFDAlgorithmProps';
  baseProperties: AlgorithmProps;
  hasConfidenceThreshold: Scalars['Boolean'];
};

export type Column = {
  __typename?: 'Column';
  index: Scalars['Int'];
  name: Scalars['String'];
};

export type Fd = {
  __typename?: 'FD';
  lhs: Array<Maybe<Column>>;
  rhs: Column;
};

export type FdaResult = FdAlgorithm | TaskNotFoundError;

export type FdAlgorithm = {
  __typename?: 'FDAlgorithm';
  baseInfo: BaseAlgResInfo;
  discoveredFDs: Array<Maybe<Fd>>;
  primaryKeys: Array<Maybe<Column>>;
};

export type FdAlgorithmConfig = {
  __typename?: 'FDAlgorithmConfig';
  name: Scalars['String'];
  properties: FdAlgorithmProps;
};

export type FdAlgorithmProps = {
  __typename?: 'FDAlgorithmProps';
  baseProperties: AlgorithmProps;
};

export type InputDatasetConfig = {
  __typename?: 'InputDatasetConfig';
  delimiter: Scalars['String'];
  hasHeader: Scalars['Boolean'];
  name: Scalars['String'];
};

export type InputFileConfig = {
  __typename?: 'InputFileConfig';
  allowedFileFormats: Array<Maybe<Scalars['String']>>;
  allowedSeparators: Array<Maybe<Scalars['String']>>;
  maxFileSize: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  FDAResult?: Maybe<FdaResult>;
  algorithmsConfig?: Maybe<AlgorithmsConfig>;
  numberSeven: Scalars['Int'];
  numberSix: Scalars['Int'];
  taskInfo?: Maybe<TaskInfoResult>;
};


export type QueryFdaResultArgs = {
  id: Scalars['ID'];
};


export type QueryTaskInfoArgs = {
  id: Scalars['ID'];
};

export type TaskInfoResult = BaseTaskInfo | TaskNotFoundError;

export type TaskNotFoundError = {
  __typename?: 'TaskNotFoundError';
  msg: Scalars['String'];
};

export type TaskStatus = {
  __typename?: 'TaskStatus';
  currentPhase: Scalars['Int'];
  msg: Scalars['String'];
  phaseName: Scalars['String'];
  progress: Scalars['Float'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AlgorithmProps: ResolverTypeWrapper<AlgorithmProps>;
  AlgorithmsConfig: ResolverTypeWrapper<AlgorithmsConfig>;
  BaseAlgResInfo: ResolverTypeWrapper<BaseAlgResInfo>;
  BaseTaskInfo: ResolverTypeWrapper<BaseTaskInfo>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CFD: ResolverTypeWrapper<Cfd>;
  CFDAlgorithm: ResolverTypeWrapper<CfdAlgorithm>;
  CFDAlgorithmProps: ResolverTypeWrapper<CfdAlgorithmProps>;
  Column: ResolverTypeWrapper<Column>;
  FD: ResolverTypeWrapper<Fd>;
  FDAResult: ResolversTypes['FDAlgorithm'] | ResolversTypes['TaskNotFoundError'];
  FDAlgorithm: ResolverTypeWrapper<FdAlgorithm>;
  FDAlgorithmConfig: ResolverTypeWrapper<FdAlgorithmConfig>;
  FDAlgorithmProps: ResolverTypeWrapper<FdAlgorithmProps>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  InputDatasetConfig: ResolverTypeWrapper<InputDatasetConfig>;
  InputFileConfig: ResolverTypeWrapper<InputFileConfig>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  TaskInfoResult: ResolversTypes['BaseTaskInfo'] | ResolversTypes['TaskNotFoundError'];
  TaskNotFoundError: ResolverTypeWrapper<TaskNotFoundError>;
  TaskStatus: ResolverTypeWrapper<TaskStatus>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AlgorithmProps: AlgorithmProps;
  AlgorithmsConfig: AlgorithmsConfig;
  BaseAlgResInfo: BaseAlgResInfo;
  BaseTaskInfo: BaseTaskInfo;
  Boolean: Scalars['Boolean'];
  CFD: Cfd;
  CFDAlgorithm: CfdAlgorithm;
  CFDAlgorithmProps: CfdAlgorithmProps;
  Column: Column;
  FD: Fd;
  FDAResult: ResolversParentTypes['FDAlgorithm'] | ResolversParentTypes['TaskNotFoundError'];
  FDAlgorithm: FdAlgorithm;
  FDAlgorithmConfig: FdAlgorithmConfig;
  FDAlgorithmProps: FdAlgorithmProps;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  InputDatasetConfig: InputDatasetConfig;
  InputFileConfig: InputFileConfig;
  Int: Scalars['Int'];
  Query: {};
  String: Scalars['String'];
  TaskInfoResult: ResolversParentTypes['BaseTaskInfo'] | ResolversParentTypes['TaskNotFoundError'];
  TaskNotFoundError: TaskNotFoundError;
  TaskStatus: TaskStatus;
};

export type AlgorithmPropsResolvers<ContextType = any, ParentType extends ResolversParentTypes['AlgorithmProps'] = ResolversParentTypes['AlgorithmProps']> = {
  hasArityConstraint?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasErrorThreshold?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isMiltithreaded?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AlgorithmsConfigResolvers<ContextType = any, ParentType extends ResolversParentTypes['AlgorithmsConfig'] = ResolversParentTypes['AlgorithmsConfig']> = {
  allowedCFDAlgorithms?: Resolver<Maybe<Array<Maybe<ResolversTypes['CFDAlgorithmProps']>>>, ParentType, ContextType>;
  allowedCFDDatasets?: Resolver<Array<Maybe<ResolversTypes['InputDatasetConfig']>>, ParentType, ContextType>;
  allowedFDAlgorithms?: Resolver<Array<Maybe<ResolversTypes['FDAlgorithmConfig']>>, ParentType, ContextType>;
  allowedFDDatasets?: Resolver<Array<Maybe<ResolversTypes['InputDatasetConfig']>>, ParentType, ContextType>;
  fileConfig?: Resolver<ResolversTypes['InputFileConfig'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BaseAlgResInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['BaseAlgResInfo'] = ResolversParentTypes['BaseAlgResInfo']> = {
  elapsedTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tableHeader?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  taskInfo?: Resolver<Maybe<ResolversTypes['BaseTaskInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BaseTaskInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['BaseTaskInfo'] = ResolversParentTypes['BaseTaskInfo']> = {
  ID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  algorithmName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errorThreshold?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TaskStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CfdResolvers<ContextType = any, ParentType extends ResolversParentTypes['CFD'] = ResolversParentTypes['CFD']> = {
  fd?: Resolver<ResolversTypes['FD'], ParentType, ContextType>;
  lhsPatterns?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  rhsPattern?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CfdAlgorithmResolvers<ContextType = any, ParentType extends ResolversParentTypes['CFDAlgorithm'] = ResolversParentTypes['CFDAlgorithm']> = {
  baseInfo?: Resolver<ResolversTypes['BaseAlgResInfo'], ParentType, ContextType>;
  discoveredFDs?: Resolver<Array<Maybe<ResolversTypes['CFD']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CfdAlgorithmPropsResolvers<ContextType = any, ParentType extends ResolversParentTypes['CFDAlgorithmProps'] = ResolversParentTypes['CFDAlgorithmProps']> = {
  baseProperties?: Resolver<ResolversTypes['AlgorithmProps'], ParentType, ContextType>;
  hasConfidenceThreshold?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ColumnResolvers<ContextType = any, ParentType extends ResolversParentTypes['Column'] = ResolversParentTypes['Column']> = {
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FdResolvers<ContextType = any, ParentType extends ResolversParentTypes['FD'] = ResolversParentTypes['FD']> = {
  lhs?: Resolver<Array<Maybe<ResolversTypes['Column']>>, ParentType, ContextType>;
  rhs?: Resolver<ResolversTypes['Column'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FdaResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['FDAResult'] = ResolversParentTypes['FDAResult']> = {
  __resolveType: TypeResolveFn<'FDAlgorithm' | 'TaskNotFoundError', ParentType, ContextType>;
};

export type FdAlgorithmResolvers<ContextType = any, ParentType extends ResolversParentTypes['FDAlgorithm'] = ResolversParentTypes['FDAlgorithm']> = {
  baseInfo?: Resolver<ResolversTypes['BaseAlgResInfo'], ParentType, ContextType>;
  discoveredFDs?: Resolver<Array<Maybe<ResolversTypes['FD']>>, ParentType, ContextType>;
  primaryKeys?: Resolver<Array<Maybe<ResolversTypes['Column']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FdAlgorithmConfigResolvers<ContextType = any, ParentType extends ResolversParentTypes['FDAlgorithmConfig'] = ResolversParentTypes['FDAlgorithmConfig']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  properties?: Resolver<ResolversTypes['FDAlgorithmProps'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FdAlgorithmPropsResolvers<ContextType = any, ParentType extends ResolversParentTypes['FDAlgorithmProps'] = ResolversParentTypes['FDAlgorithmProps']> = {
  baseProperties?: Resolver<ResolversTypes['AlgorithmProps'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InputDatasetConfigResolvers<ContextType = any, ParentType extends ResolversParentTypes['InputDatasetConfig'] = ResolversParentTypes['InputDatasetConfig']> = {
  delimiter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasHeader?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InputFileConfigResolvers<ContextType = any, ParentType extends ResolversParentTypes['InputFileConfig'] = ResolversParentTypes['InputFileConfig']> = {
  allowedFileFormats?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  allowedSeparators?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  maxFileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  FDAResult?: Resolver<Maybe<ResolversTypes['FDAResult']>, ParentType, ContextType, RequireFields<QueryFdaResultArgs, 'id'>>;
  algorithmsConfig?: Resolver<Maybe<ResolversTypes['AlgorithmsConfig']>, ParentType, ContextType>;
  numberSeven?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  numberSix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  taskInfo?: Resolver<Maybe<ResolversTypes['TaskInfoResult']>, ParentType, ContextType, RequireFields<QueryTaskInfoArgs, 'id'>>;
};

export type TaskInfoResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskInfoResult'] = ResolversParentTypes['TaskInfoResult']> = {
  __resolveType: TypeResolveFn<'BaseTaskInfo' | 'TaskNotFoundError', ParentType, ContextType>;
};

export type TaskNotFoundErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskNotFoundError'] = ResolversParentTypes['TaskNotFoundError']> = {
  msg?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskStatus'] = ResolversParentTypes['TaskStatus']> = {
  currentPhase?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  msg?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phaseName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  progress?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AlgorithmProps?: AlgorithmPropsResolvers<ContextType>;
  AlgorithmsConfig?: AlgorithmsConfigResolvers<ContextType>;
  BaseAlgResInfo?: BaseAlgResInfoResolvers<ContextType>;
  BaseTaskInfo?: BaseTaskInfoResolvers<ContextType>;
  CFD?: CfdResolvers<ContextType>;
  CFDAlgorithm?: CfdAlgorithmResolvers<ContextType>;
  CFDAlgorithmProps?: CfdAlgorithmPropsResolvers<ContextType>;
  Column?: ColumnResolvers<ContextType>;
  FD?: FdResolvers<ContextType>;
  FDAResult?: FdaResultResolvers<ContextType>;
  FDAlgorithm?: FdAlgorithmResolvers<ContextType>;
  FDAlgorithmConfig?: FdAlgorithmConfigResolvers<ContextType>;
  FDAlgorithmProps?: FdAlgorithmPropsResolvers<ContextType>;
  InputDatasetConfig?: InputDatasetConfigResolvers<ContextType>;
  InputFileConfig?: InputFileConfigResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  TaskInfoResult?: TaskInfoResultResolvers<ContextType>;
  TaskNotFoundError?: TaskNotFoundErrorResolvers<ContextType>;
  TaskStatus?: TaskStatusResolvers<ContextType>;
};

