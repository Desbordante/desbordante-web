import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_MAIN_TASK_DEPS } from "@graphql/operations/queries/getDeps";
import {
  GetMainTaskDeps,
  GetMainTaskDepsVariables,
} from "@graphql/operations/queries/__generated__/GetMainTaskDeps";
import { FDSortBy, OrderBy } from "__generated__/globalTypes";
import { ReportsLayout } from "@components/ReportsLayout/ReportsLayout";
import { ReactElement, useEffect } from "react";
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
import { useFilters } from "@components/Filters/Filters";

const ReportsDependencies: NextPage = () => {
  const router = useRouter();
  const taskID = router.query.taskID as string;

  const { search, setSearch } = useFilters();

  const [getDeps, { loading, data, called }] = useLazyQuery<
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
          FDSortBy: FDSortBy.LHS_COL_ID,
          orderBy: OrderBy.DESC,
          pagination: { limit: 10, offset: 0 },
        },
      },
    });
  }, [search]);

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

  return (
    <ReportsLayout>
      <h5>Primitive List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <div className={styles.buttons}>
          <Button variant="secondary" size="md" icon={filterIcon}>
            Filters
          </Button>
          <Button variant="secondary" size="md" icon={orderingIcon}>
            Ordering
          </Button>
          <Button variant="secondary" size="md" icon={eyeIcon}>
            Visibility
          </Button>
        </div>
      </div>

      <div className={styles.rows}>
        {called && !loading && data && (
          <>
            {data.taskInfo.data.result?.__typename === "FDTaskResult" &&
              data.taskInfo.data.result.filteredDeps.__typename ===
                "FilteredFDs" &&
              _.map(data.taskInfo.data.result.filteredDeps.FDs, (row, i) => (
                <div key={i} className={styles.row}>
                  {makeSide(row.lhs)}
                  <Image src={longArrowIcon} />
                  {makeSide(row.rhs)}
                </div>
              ))}
          </>
        )}
      </div>
    </ReportsLayout>
  );
};
export default ReportsDependencies;
