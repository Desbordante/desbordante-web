import { useCallback, useContext, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";

import { FDsFilter, Pagination, PrimitiveType } from "../types/globalTypes";
import { TaskResult } from "../types/taskInfo";
import { ErrorContext } from "../components/ErrorContext";
import { GET_FUNCTIONAL_DEPENDENCIES } from "../graphql/operations/queries/primitives/getFDs";
import {
  getFDs,
  getFDsVariables,
} from "../graphql/operations/queries/primitives/__generated__/getFDs";
import { GET_CONDITIONAL_DEPENDENCIES } from "../graphql/operations/queries/primitives/getCFDs";
import {
  getCFDs,
  getCFDsVariables,
} from "../graphql/operations/queries/primitives/__generated__/getCFDs";
import { GET_ASSOCIATION_RULES } from "../graphql/operations/queries/primitives/getARs";
import {
  getARs,
  getARsVariables,
} from "../graphql/operations/queries/primitives/__generated__/getARs";
import { PrimitiveFilter } from "../types/primitives";

export const useTaskResult = (
  taskID?: string,
  primitiveType?: PrimitiveType,
  filter?: PrimitiveFilter
) => {
  const { showError } = useContext(ErrorContext)!;

  const [taskResult, setTaskResult] = useState<TaskResult>();
  const [loading, setLoading] = useState(false);

  const [getFDs] = useLazyQuery<getFDs, getFDsVariables>(
    GET_FUNCTIONAL_DEPENDENCIES
  );
  const [getCFDs] = useLazyQuery<getCFDs, getCFDsVariables>(
    GET_CONDITIONAL_DEPENDENCIES
  );
  const [getARs] = useLazyQuery<getARs, getARsVariables>(GET_ASSOCIATION_RULES);

  const getTaskResult = useCallback(async () => {
    if (!taskID || !primitiveType || !filter) {
      return;
    }

    await setLoading(true);
    let res;

    try {
      switch (primitiveType) {
        case PrimitiveType.FD: {
          res = await getFDs({
            variables: { taskID, filter: filter as FDsFilter },
          });
          break;
        }
        case PrimitiveType.CFD: {
          res = await getCFDs({
            variables: { taskID, filter: filter as Pagination },
          });
          break;
        }
        case PrimitiveType.AR: {
          res = await getARs({
            variables: { taskID, filter: filter as Pagination },
          });
          break;
        }
        default: {
          showError({ message: "Unexpected application behaviour" });
          return;
        }
      }

      setTaskResult({ [primitiveType]: res.data?.taskInfo.data.result });
    } catch (error: any) {
      showError(error);
      return;
    }
    setLoading(false);
  }, [filter, getARs, getCFDs, getFDs, primitiveType, showError, taskID]);

  useEffect(() => {
    getTaskResult();
  }, [getTaskResult]);

  return { taskResult, loading };
};
