import {useCallback, useContext, useEffect, useState} from "react";
import {useLazyQuery} from "@apollo/client";
import {PrimitiveType} from "../types/globalTypes";
import {GET_FDS_PIE_CHART_DATA} from "../graphql/operations/queries/FD/getFDsPieChartData";
import {
  getFDsPieChartData,
  getFDsPieChartDataVariables,
} from "../graphql/operations/queries/FD/__generated__/getFDsPieChartData";
import {GET_CFDS_PIE_CHART_DATA} from "../graphql/operations/queries/CFD/getCFDsPieChartData";
import {
  getCFDsPieChartData,
  getCFDsPieChartDataVariables,
} from "../graphql/operations/queries/CFD/__generated__/getCFDsPieChartData";
import {ErrorContext} from "../components/ErrorContext";
import {PieChartData} from "../types/taskInfo";

export const usePieChartData = (
  taskID?: string,
  primitiveType?: PrimitiveType,
  isFinished?: boolean
) => {
  const {showError} = useContext(ErrorContext)!;

  const [pieChartData, setPieChartData] = useState<PieChartData>();
  const [loading, setLoading] = useState(false);

  const [getFDsPieChartData] = useLazyQuery<getFDsPieChartData,
    getFDsPieChartDataVariables>(GET_FDS_PIE_CHART_DATA);
  const [getCFDsPieChartData] = useLazyQuery<getCFDsPieChartData,
    getCFDsPieChartDataVariables>(GET_CFDS_PIE_CHART_DATA);

  const getPieChartData = useCallback(async () => {
    if (!taskID || !primitiveType || !isFinished) {
      return;
    }

    let res;
    await setLoading(true);
    try {
      switch (primitiveType) {
        case PrimitiveType.FD: {
          res = await getFDsPieChartData({variables: {taskID}});
          break;
        }
        case PrimitiveType.CFD: {
          res = await getCFDsPieChartData({variables: {taskID}});
          break;
        }
        default: {
          // showError({ message: "Unexpected application behaviour" });
          return;
        }
      }

      const result = res && res.data?.taskInfo.data.result;
      if (result) {
        setPieChartData({
          // @ts-ignore
          [primitiveType]: result.pieChartData,
        });
      }
    } catch (error: any) {
      showError(error);
      return;
    }

    setLoading(false);
  }, [
    getCFDsPieChartData,
    getFDsPieChartData,
    primitiveType,
    showError,
    taskID,
    isFinished,
  ]);

  useEffect(() => {
    getPieChartData();
  }, [getPieChartData]);

  useEffect(() => {
    if (!taskID) {
      setPieChartData(undefined);
      setLoading(false);
    }
  }, [taskID]);

  return {pieChartData, loading};
};
