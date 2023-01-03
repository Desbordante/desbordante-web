#pragma once

#include "enums.h"

namespace consumer::tables {
constexpr auto kState = "TasksState";
constexpr auto kColumnStats = "ColumnStats";
}  // namespace consumer::tables

namespace consumer::fields {
constexpr auto kFileID = "fileID";
constexpr auto kTaskID = "taskID";
constexpr auto kColumnIndex = "columnIndex";

constexpr auto kClusterID = "clusterID";

constexpr auto kAttemptNumber = "attemptNumber";
constexpr auto kStatus = "status";
constexpr auto kPhaseName = "phaseName";
constexpr auto kCurrentPhase = "currentPhase";
constexpr auto kProgress = "progress";
constexpr auto kMaxPhase = "maxPhase";
constexpr auto kErrorMsg = "errorMsg";
constexpr auto kIsExecuted = "isExecuted";
constexpr auto kElapsedTime = "elapsedTime";

constexpr auto kTypoFD = "typo_fd";
constexpr auto kWithoutPatterns = "withoutPatterns";
constexpr auto kWithPatterns = "withPatterns";
constexpr auto kValueDictionary = "valueDictionary";
constexpr auto kPKColumnIndices = "PKColumnIndices";
constexpr auto kDeps = "deps";
constexpr auto kDepsAmount = "depsAmount";
constexpr auto kTypoClusters = "TypoClusters";
constexpr auto kClustersCount = "clustersCount";
constexpr auto kSuspiciousIndices = "suspiciousIndices";
constexpr auto kSquashedNotSortedCluster = "squashedNotSortedCluster";
constexpr auto kSquashedSortedCluster = "squashedSortedCluster";
constexpr auto kNotSquashedNotSortedCluster = "notSquashedNotSortedCluster";
constexpr auto kNotSquashedSortedCluster = "notSquashedSortedCluster";
constexpr auto kNotSquashedItemsAmount = "notSquashedItemsAmount";
constexpr auto kSquashedItemsAmount = "squashedItemsAmount";
}  // namespace consumer::fields