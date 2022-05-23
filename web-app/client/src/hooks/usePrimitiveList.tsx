import { useCallback, useContext, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";

import { PrimitiveType } from "../types/globalTypes";
import { TaskResult } from "../types/taskInfo";
import { ErrorContext } from "../components/ErrorContext";
import { GET_FDS } from "../graphql/operations/queries/FD/getFDs";
import {
  getFDs,
  getFDsVariables,
} from "../graphql/operations/queries/FD/__generated__/getFDs";
import { GET_CFDS } from "../graphql/operations/queries/CFD/getCFDs";
import {
  getCFDs,
  getCFDsVariables,
} from "../graphql/operations/queries/CFD/__generated__/getCFDs";
import { GET_ARS } from "../graphql/operations/queries/AR/getARs";
import {
  getARs,
  getARsVariables,
} from "../graphql/operations/queries/AR/__generated__/getARs";
import { PrimitiveFilter } from "../types/primitives";
import {
  getTypoFDs,
  getTypoFDsVariables,
} from "../graphql/operations/queries/EDP/__generated__/getTypoFDs";
import { GET_TYPO_FDS } from "../graphql/operations/queries/EDP/getTypoFDs";

export const usePrimitiveList = (
  taskID?: string,
  primitiveType?: PrimitiveType,
  filter?: PrimitiveFilter,
  isFinished?: boolean
) => {
  const { showError } = useContext(ErrorContext)!;

  const [taskResult, setTaskResult] = useState<TaskResult>();
  const [loading, setLoading] = useState(false);

  const [getFDs] = useLazyQuery<getFDs, getFDsVariables>(GET_FDS, {fetchPolicy: "network-only"});
  const [getCFDs] = useLazyQuery<getCFDs, getCFDsVariables>(GET_CFDS, {fetchPolicy: "network-only"});
  const [getARs] = useLazyQuery<getARs, getARsVariables>(GET_ARS, {fetchPolicy: "network-only"});
  const [getTypoFDs] = useLazyQuery<getTypoFDs, getTypoFDsVariables>(
    GET_TYPO_FDS, {fetchPolicy: "network-only"}
  );

  const getTaskResult = useCallback(async () => {
    if (!taskID || !primitiveType || !filter || !isFinished) {
      return;
    }

    setLoading(true);
    let res;

    try {
      switch (primitiveType) {
        case PrimitiveType.FD: {
          res = await getFDs({
            variables: { taskID, filter: filter.FD },
          });
          break;
        }
        case PrimitiveType.CFD: {
          res = await getCFDs({
            variables: { taskID, filter: filter.CFD },
          });
          break;
        }
        case PrimitiveType.AR: {
          res = await getARs({
            variables: { taskID, filter: filter.AR },
          });
          break;
        }
        case PrimitiveType.TypoFD: {
          res = await getTypoFDs({
            variables: { taskID, filter: filter.TypoFD },
          });
          break;
        }
        default: {
          showError({ message: "Unexpected application behaviour" });
          return;
        }
      }

      setTaskResult({
        [primitiveType]: res.data?.taskInfo.data.result,
        // @ts-ignore
        depsAmount: res.data?.taskInfo.data.result.depsAmount,
      });
    } catch (error: any) {
      showError(error);
      return;
    }
    setLoading(false);
  }, [
    filter,
    getARs,
    getCFDs,
    getFDs,
    primitiveType,
    showError,
    taskID,
    isFinished,
  ]);

  useEffect(() => {
    getTaskResult();
  }, [getTaskResult]);

  useEffect(() => {
    if (!taskID) {
      setTaskResult(undefined);
      setLoading(false);
    }
  }, [taskID]);

  return { taskResult, loading };
};
