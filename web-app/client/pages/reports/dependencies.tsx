import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useLazyQuery } from "@apollo/client";
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
import { OrderingWindow, useFilters } from "@components/Filters/Filters";
import Pagination from "@components/Pagination/Pagination";
import classNames from "classnames";

import { useForm } from "react-hook-form";

const ReportsDependencies: NextPage = () => {
  const router = useRouter();
  const taskID = router.query.taskID as string;

  const {
    fields: { search, page, ordering, direction },
    setValue,
  } = useFilters();

  const [selectedRow, setSelectedRow] = useState<number | undefined>();

  const [getDeps, { loading, data, called, previousData }] = useLazyQuery<
    GetMainTaskDeps,
    GetMainTaskDepsVariables
  >(GET_MAIN_TASK_DEPS);

  useEffect(() => {
    getDeps({
      variables: {
        taskID: taskID,
        filter: {
          withoutKeys: false,
          filterString: search,
          FDSortBy: (ordering as FDSortBy) || FDSortBy.LHS_NAME,
          orderBy: direction,
          pagination: { limit: 10, offset: (page - 1) * 10 },
        },
      },
    });
  }, [taskID, search, page, ordering, direction]);

  const makeSide: (data: Column | Column[]) => ReactElement = (data) => {
    if (Array.isArray(data)) {
      return (
        <>
          {data.map((e) => (
            <span className={styles.attr}>{e.name}</span>
          ))}
        </>
      );
    } else {
      return makeSide([data]);
    }
  };

  // todo add loading text/animation, maybe in Pagination component too
  const shownData = loading ? previousData : data;
  const recordsCount =
    shownData?.taskInfo.data.result?.__typename === "FDTaskResult" &&
    shownData?.taskInfo.data.result.depsAmount;

  const primitive = {
    FDTaskResult: MainPrimitiveType.FD,
    ARTaskResult: MainPrimitiveType.AR,
    CFDTaskResult: MainPrimitiveType.CFD,
    TypoFDTaskResult: MainPrimitiveType.TypoFD,
    TypoClusterTaskResult: MainPrimitiveType.TypoFD,
  }[shownData?.taskInfo.data.result?.__typename || "FDTaskResult"];

  const [isOrderingShown, setIsOrderingShown] = useState(false);

  return (
    <ReportsLayout>
      {isOrderingShown && (
        <OrderingWindow
          {...{
            setIsOrderingShown,
            ordering,
            primitive,
            direction,
          }}
          setOrdering={(o) => setValue("ordering", o)}
          setDirection={(d) => setValue("direction", d)}
        />
      )}

      <h5>Primitive List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          value={search}
          // onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <div className={styles.buttons}>
          <Button variant="secondary" size="md" icon={filterIcon}>
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
          <Button variant="secondary" size="md" icon={eyeIcon}>
            Visibility
          </Button>
        </div>
      </div>

      <div className={styles.rows}>
        {called && shownData && (
          <>
            {shownData.taskInfo.data.result?.__typename === "FDTaskResult" &&
              shownData.taskInfo.data.result.filteredDeps.__typename ===
                "FilteredFDs" &&
              _.map(
                shownData.taskInfo.data.result.filteredDeps.FDs,
                (row, i) => (
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
                    {makeSide(row.rhs)}
                  </div>
                )
              )}
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
export default ReportsDependencies;
