import Button from "@components/Button";
import PopupWindowContainer from "@components/PopupWindowContainer/PopupWindowContainer";
import React, { useState, FC, useEffect, useCallback } from "react";
import { Checkbox } from "@components/Inputs";
import _ from "lodash";
import {
  FDSortBy,
  CFDSortBy,
  ARSortBy,
  OrderBy,
  PrimitiveType,
} from "types/globalTypes";
import styles from "./Filters.module.scss";

export type Sorting = FDSortBy | CFDSortBy | ARSortBy;

export type FiltersFields = {
  ordering: Sorting;
  direction: OrderBy;
  search: string;
  page: number;
};

export const useFilters = (primitive: PrimitiveType) => {
  const defaultOrdering = useCallback(
    () => _.keys(orderingTitles[primitive])[0] as Sorting,
    [primitive]
  );

  const [fields, setFields] = useState<FiltersFields>({
    page: 1,
    ordering: defaultOrdering(),
    direction: OrderBy.ASC,
    search: "",
  });

  const setValue = (field: keyof FiltersFields, value: string | number) => {
    setFields({ ...fields, [field]: value });
  };

  useEffect(() => setValue("ordering", defaultOrdering()), [primitive]);

  return { setValue, fields };
};

const orderingTitles = {
  [PrimitiveType.FD]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
  [PrimitiveType.CFD]: {
    [CFDSortBy.LHS_COL_NAME]: "LHS NAME",
    [CFDSortBy.RHS_COL_NAME]: "RHS NAME",
    [CFDSortBy.CONF]: "Condfidence",
    [CFDSortBy.LHS_PATTERN]: "LHS PATTERN",
    [CFDSortBy.LHS_PATTERN]: "RHS PATTERN",
  },
  [PrimitiveType.AR]: {
    [ARSortBy.CONF]: "Confidence",
    [ARSortBy.DEFAULT]: "Default",
    [ARSortBy.LHS_NAME]: "LHS NAME",
    [ARSortBy.RHS_NAME]: "RHS NAME",
  },
  [PrimitiveType.TypoFD]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
  [PrimitiveType.TypoCluster]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
};

type OrderingProps = {
  setIsOrderingShown: (arg: boolean) => void;
  ordering: Sorting;
  primitive: PrimitiveType;
  direction: OrderBy;
  setOrdering: (arg: Sorting) => void;
  setDirection: (arg: OrderBy) => void;
};

export const OrderingWindow: FC<OrderingProps> = ({
  setIsOrderingShown,
  primitive,
  ordering,
  direction,
  setOrdering,
  setDirection,
}) => {
  const handleClick = (newOrdering: Sorting) => () => {
    if (newOrdering === ordering) {
      setOrdering(FDSortBy.LHS_NAME);
    } else {
      setOrdering(newOrdering);
    }
  };

  return (
    <>
      <PopupWindowContainer onOutsideClick={() => setIsOrderingShown(false)}>
        <div className={styles.container}>
          <h5>Choose ordering</h5>
          {_.map(orderingTitles[primitive], (title, name) => (
            <Button
              key={title}
              variant={ordering === name ? "primary" : "secondary"}
              size="sm"
              onClick={handleClick(name as Sorting)}
            >
              {title}
            </Button>
          ))}

          <div className={styles.direction}>
            <Checkbox
              type="radio"
              label="ASC"
              checked={direction === OrderBy.ASC}
              onClick={() => setDirection(OrderBy.ASC)}
            />
            <Checkbox
              type="checkbox"
              label="DESC"
              checked={direction === OrderBy.DESC}
              onClick={() => setDirection(OrderBy.DESC)}
            />
          </div>
        </div>
      </PopupWindowContainer>
    </>
  );
};
