import { gql } from "@apollo/client";

export const CREATE_CLUSTERS_PREVIEW = gql`
    mutation createClustersPreview($taskId: String!, $typoFD: [Int!]) {
        createTypoMinerTask(props: {type: TypoCluster, typoTaskID: $taskId, typoFD: $typoFD}) {
            taskID
        }
    }
`;
