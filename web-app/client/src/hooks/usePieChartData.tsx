import {useCallback, useContext, useEffect, useState} from "react";
import {useLazyQuery} from "@apollo/client";
import {PrimitiveType} from "../types/globalTypes";
import {ErrorContext} from "../components/ErrorContext";
import {
  isMainPrimitiveType,
  isPrimitiveWithPieChartData,
  PieChartData, primitivesWithPieChartData,
} from "../types/taskInfo";
import {getPieChartData, getPieChartDataVariables} from "../graphql/operations/queries/__generated__/getPieChartData";
import {GET_PIE_CHART_DATA} from "../graphql/operations/queries/getPieChartData";

export const usePieChartData = (
  taskID?: string,
  primitiveType?: PrimitiveType,
  isFinished?: boolean
) => {
  const {showError} = useContext(ErrorContext)!;

  const [pieChartData, setPieChartData] = useState<PieChartData>();
  const [loading, setLoading] = useState(false);

  const [getPieChartData] = useLazyQuery<getPieChartData,
    getPieChartDataVariables>(GET_PIE_CHART_DATA);

  const getData = useCallback(async () => {
    if (!taskID || !primitiveType || !isFinished) {
      return;
    }

    setLoading(true);

    try {
      if (!isMainPrimitiveType(primitiveType) || !isPrimitiveWithPieChartData(primitiveType)) {
        return;
      }
      const res = await getPieChartData({ variables: { taskID } });

      if (res.data?.taskInfo.data.__typename !== "TaskWithDepsData") {
        return;
      }

      const {data: {pieChartData : chartData}} = res.data.taskInfo;

      if (chartData == null) {
        return;
      }

      const isPieChartData = (data: typeof chartData): data is PieChartData =>
        primitivesWithPieChartData.some(type => data.__typename.startsWith(type));

      if (isPieChartData(chartData)) {
        setPieChartData(chartData);
      }
    } catch (error: any) {
      showError(error);
      return;
    }

    setLoading(false);
  }, [
    getPieChartData,
    primitiveType,
    showError,
    taskID,
    isFinished,
  ]);

  useEffect(() => {
    getData();
}, [getData]);

  useEffect(() => {
    if (!taskID) {
      setPieChartData(undefined);
      setLoading(false);
    }
  }, [taskID]);

  return {pieChartData, loading};
};
