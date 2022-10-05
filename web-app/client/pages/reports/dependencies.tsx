import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_MAIN_TASK_DEPS } from "@graphql/operations/queries/getDeps";
import {
  GetMainTaskDeps,
  GetMainTaskDepsVariables,
} from "@graphql/operations/queries/__generated__/GetMainTaskDeps";
import { FDSortBy, MainPrimitiveType } from "__generated__/globalTypes";
import { ReportsLayout } from "@components/ReportsLayout/ReportsLayout";
import { ReactElement, useContext, useEffect, useState } from "react";
import _ from "lodash";
import { Text } from "@components/Inputs";
import Button from "@components/Button";
import styles from "@styles/Dependencies.module.scss";
import filterIcon from "@assets/icons/filter.svg";
import orderingIcon from "@assets/icons/ordering.svg";
import eyeIcon from "@assets/icons/eye.svg";
import longArrowIcon from "@assets/icons/long-arrow.svg";
import Image from "next/image";
import { Column } from "@graphql/operations/fragments/__generated__/Column";
import {
  FilteringWindow,
  getSortingParams,
  OrderingWindow,
  useFilters,
} from "@components/Filters/Filters";
import Pagination from "@components/Pagination/Pagination";
import classNames from "classnames";
import { GET_TASK_INFO } from "@graphql/operations/queries/getTaskInfo";
import {
  getTaskInfo,
  getTaskInfoVariables,
} from "@graphql/operations/queries/__generated__/getTaskInfo";
import { OrderBy, PrimitiveType } from "types/globalTypes";
import client from "@graphql/client";

type GeneralColumn = {
  column: Column;
  pattern?: string;
};

type Props = {
  defaultData?: GetMainTaskDeps;
};

const ReportsDependencies: NextPage<Props> = ({ defaultData }) => {
  const router = useRouter();
  const taskID = router.query.taskID as string;

  const { data: taskInfo } = useQuery<getTaskInfo, getTaskInfoVariables>(
    GET_TASK_INFO,
    {
      variables: { taskID },
    }
  );

  const primitive: PrimitiveType | null =
    taskInfo?.taskInfo.data.baseConfig.type || null;
  const {
    fields: {
      search,
      page,
      ordering,
      direction,
      mustContainRhsColIndices,
      mustContainLhsColIndices,
    },
    setValue,
  } = useFilters(primitive || PrimitiveType.FD);

  const [infoVisible, setInfoVisible] = useState(true);

  const [selectedRow, setSelectedRow] = useState<number | undefined>();

  const [getDeps, { loading, data, called, previousData }] = useLazyQuery<
    GetMainTaskDeps,
    GetMainTaskDepsVariables
  >(GET_MAIN_TASK_DEPS);

  useEffect(() => {
    if (!primitive) return;
    const sortingParams = {
      [(primitive === PrimitiveType.TypoFD ? PrimitiveType.FD : primitive) +
      "SortBy"]: ordering,
    };
    getDeps({
      variables: {
        taskID: taskID,
        filter: {
          withoutKeys: false,
          filterString: search,
          pagination: { limit: 10, offset: (page - 1) * 10 },
          ...sortingParams,
          orderBy: direction,
          mustContainRhsColIndices: !mustContainRhsColIndices
            ? null
            : mustContainRhsColIndices
                .split(",")
                .map((e) => Number.parseFloat(e)),
          mustContainLhsColIndices: !mustContainLhsColIndices
            ? null
            : mustContainLhsColIndices
                .split(",")
                .map((e) => Number.parseFloat(e)),
        },
      },
    });
  }, [taskID, primitive, search, page, ordering, direction]);

  const makeSide: (data: GeneralColumn | GeneralColumn[]) => ReactElement = (
    data
  ) => {
    if (Array.isArray(data)) {
      return (
        <>
          {data.map((e) => (
            <span className={styles.attr}>
              {e.column.name}
              {infoVisible && e.pattern ? " | " + e.pattern : ""}
            </span>
          ))}
        </>
      );
    } else {
      return makeSide([data]);
    }
  };

  // todo add loading text/animation, maybe in Pagination component too
  const shownData = (loading ? previousData : data) || defaultData;
  const recordsCount =
    shownData?.taskInfo.data.result?.__typename === "FDTaskResult" &&
    shownData?.taskInfo.data.result.depsAmount;

  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const [isFilteringShown, setIsFilteringShown] = useState(false);

  const deps: () => {
    confidence?: any;
    rhs: GeneralColumn[];
    lhs: GeneralColumn[];
  }[] = () => {
    if (!shownData) return [];
    if (primitive === PrimitiveType.FD) {
      return shownData.taskInfo.data.result?.__typename === "FDTaskResult" &&
        shownData.taskInfo.data.result.filteredDeps.__typename === "FilteredFDs"
        ? shownData.taskInfo.data.result.filteredDeps.FDs.map((e) => ({
            rhs: [{ column: e.rhs }],
            lhs: e.lhs.map((e) => ({ column: e })),
          }))
        : [];
    }

    if (primitive === PrimitiveType.TypoFD) {
      return shownData.taskInfo.data.result?.__typename ===
        "TypoFDTaskResult" &&
        shownData.taskInfo.data.result.filteredDeps.__typename === "FilteredFDs"
        ? shownData.taskInfo.data.result.filteredDeps.FDs.map((e) => ({
            rhs: [{ column: e.rhs }],
            lhs: e.lhs.map((e) => ({ column: e })),
          }))
        : [];
    }

    if (primitive === PrimitiveType.CFD) {
      return shownData.taskInfo.data.result?.__typename === "CFDTaskResult" &&
        shownData.taskInfo.data.result.filteredDeps.__typename ===
          "FilteredCFDs"
        ? shownData.taskInfo.data.result.filteredDeps.CFDs.map((e) => ({
            rhs: [e.rhs],
            lhs: e.lhs,
          }))
        : [];
    }

    if (primitive === PrimitiveType.AR) {
      return shownData.taskInfo.data.result?.__typename === "ARTaskResult" &&
        shownData.taskInfo.data.result.filteredDeps.__typename === "FilteredARs"
        ? shownData.taskInfo.data.result.filteredDeps.ARs.map((e) => ({
            confidence: e.confidence,
            rhs: e.rhs.map((name) => ({ column: { name } } as GeneralColumn)),
            lhs: e.lhs.map((name) => ({ column: { name } } as GeneralColumn)),
          }))
        : [];
    }
    return [];
  };

  return (
    <ReportsLayout>
      {isOrderingShown && (
        <OrderingWindow
          {...{
            setIsOrderingShown,
            ordering,
            primitive: primitive || PrimitiveType.FD,
            direction,
          }}
          setOrdering={(o) => setValue("ordering", o)}
          setDirection={(d) => setValue("direction", d)}
        />
      )}

      {isFilteringShown && (
        <FilteringWindow
          {...{
            setIsFilteringShown,
            mustContainLhsColIndices,
            mustContainRhsColIndices,
          }}
          setMustContainRhsColIndices={(v) =>
            setValue("mustContainRhsColIndices", v)
          }
          setMustContainLhsColIndices={(v) =>
            setValue("mustContainLhsColIndices", v)
          }
        />
      )}

      <h5>Primitive List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          value={search}
          onChange={(e) => setValue("search", e.currentTarget.value)}
        />
        <div className={styles.buttons}>
          <Button
            variant="secondary"
            size="md"
            icon={filterIcon}
            onClick={() => setIsFilteringShown(true)}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={orderingIcon}
            onClick={() => setIsOrderingShown(true)}
          >
            Ordering
          </Button>
          {primitive &&
            [PrimitiveType.AR, PrimitiveType.CFD].includes(primitive) && (
              <Button
                variant="secondary"
                size="md"
                icon={eyeIcon}
                onClick={() => setInfoVisible((e) => !e)}
              >
                Visibility
              </Button>
            )}
        </div>
      </div>

      <div className={styles.rows}>
        {shownData && (
          <>
            {_.map(deps(), (row, i) => (
              <div
                key={i}
                className={classNames(
                  styles.row,
                  selectedRow === i && styles.selectedRow
                )}
                onClick={() => setSelectedRow(i)}
              >
                {makeSide(row.lhs)}
                <Image src={longArrowIcon} />
                {typeof row.confidence !== "undefined" && (
                  <p>{row.confidence}</p>
                )}
                {makeSide(row.rhs)}
              </div>
            ))}
          </>
        )}
      </div>

      <div className={styles.pagination}>
        <Pagination
          onChange={(n) => setValue("page", n)}
          current={page}
          count={Math.ceil((recordsCount || 10) / 10)}
        />
      </div>
    </ReportsLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.taskID) {
    const { data } = await client.query<getTaskInfo>({
      query: GET_TASK_INFO,
      variables: { taskID: context.query.taskID },
    });

    const sortingParams = getSortingParams(data.taskInfo.data.baseConfig.type);

    const { data: taskDeps } = await client.query<GetMainTaskDeps>({
      query: GET_MAIN_TASK_DEPS,
      variables: {
        taskID: context.query.taskID,
        filter: {
          withoutKeys: false,
          filterString: "",
          pagination: { limit: 10, offset: 0 },
          ...sortingParams,
          orderBy: OrderBy.ASC,
        },
      },
    });
    return {
      props: {
        defaultData: taskDeps,
      },
    };
  }

  return {
    props: {},
  };
};

export default ReportsDependencies;
