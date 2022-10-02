import Button from "@components/Button";
import PopupWindowContainer from "@components/PopupWindowContainer/PopupWindowContainer";
import React, { useState, FC, useContext } from "react";
import { Container } from "react-bootstrap";
import _ from "lodash";
import { FDSortBy, CFDSortBy, ARSortBy, OrderBy } from "types/globalTypes";
import { MainPrimitiveType } from "__generated__/globalTypes";
import styles from "./Filters.module.scss";
import { Checkbox } from "@components/Inputs";
import { useFormContext } from "react-hook-form";

export type Sorting = FDSortBy | CFDSortBy | ARSortBy;

export type FiltersFields = {
  ordering: Sorting;
  direction: OrderBy;
  search: string;
  page: number;
};

export const useFilters = () => {
  const [fields, setFields] = useState<FiltersFields>({
    page: 1,
    ordering: FDSortBy.LHS_NAME,
    direction: OrderBy.ASC,
    search: "",
  });

  const setValue = (field: keyof FiltersFields, value: string | number) => {
    setFields({ ...fields, [field]: value });
  };

  return { setValue, fields };
};

const orderingTitles = {
  [MainPrimitiveType.FD]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
  [MainPrimitiveType.CFD]: {
    [CFDSortBy.CONF]: "Condfidence",
    [CFDSortBy.LHS_COL_NAME]: "LHS NAME",
    [CFDSortBy.RHS_COL_NAME]: "RHS NAME",
    [CFDSortBy.LHS_PATTERN]: "LHS PATTERN",
    [CFDSortBy.LHS_PATTERN]: "RHS PATTERN",
  },
  [MainPrimitiveType.AR]: {
    [ARSortBy.CONF]: "Confidence",
    [ARSortBy.DEFAULT]: "Default",
    [ARSortBy.LHS_NAME]: "LHS NAME",
    [ARSortBy.RHS_NAME]: "RHS NAME",
  },
  [MainPrimitiveType.TypoFD]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
};

type OrderingProps = {
  setIsOrderingShown: (arg: boolean) => void;
  ordering: Sorting;
  primitive: MainPrimitiveType;
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
        <Container className="form-container bg-light m-4 m-sm-5 p-4 p-sm-5 rounded-3 w-auto shadow-lg">
          <h5>Choose ordering</h5>
          <div className={styles.container}>
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
          </div>

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
        </Container>
      </PopupWindowContainer>
    </>
  );
};
