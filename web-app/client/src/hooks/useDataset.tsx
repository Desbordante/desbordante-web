import {useCallback, useContext, useEffect, useState} from "react";
import {useLazyQuery} from "@apollo/client";

import {Pagination} from "../types/globalTypes";
import {Dataset} from "../types/taskInfo";
import {ErrorContext} from "../components/ErrorContext";
import {GET_DATASET} from "../graphql/operations/queries/getDataset";
import {
  getDataset,
  getDatasetVariables,
} from "../graphql/operations/queries/__generated__/getDataset";

export const useDataset = (taskID?: string, pagination?: Pagination) => {
  const {showError} = useContext(ErrorContext)!;

  const [dataset, setDataset] = useState<Dataset>();
  const [loading, setLoading] = useState(false);

  const [getDataset] = useLazyQuery<getDataset, getDatasetVariables>(
    GET_DATASET
  );

  const getDatasetQuery = useCallback(async () => {
    if (!taskID || !pagination) {
      return;
    }
    await setLoading(true);

    try {
      const res = await getDataset({variables: {taskID, pagination}});
      if (res.data?.taskInfo?.dataset == null) {
        throw new Error("Dataset info not found");
      }
      const { dataset: datasetInfo } = res.data.taskInfo;

      setDataset(datasetInfo);
    } catch (error: any) {
      showError(error);
      return;
    }
    setLoading(false);
  }, [getDataset, pagination, showError, taskID]);

  useEffect(() => {
    getDatasetQuery();
  }, [getDatasetQuery]);

  useEffect(() => {
    if (!taskID) {
      setDataset(undefined);
      setLoading(false);
    }
  }, [taskID]);

  return {dataset, loading};
};
