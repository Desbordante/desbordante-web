import React, { useContext } from "react";
import Button from "../Button/Button";
import clamp from "../../functions/clamp";
import { TaskContext } from "../TaskContext";

interface Props {
  primitiveType: "FD" | "CFD" | "AR" | "TypoFD";
}

const Pagination: React.FC<Props> = ({ primitiveType }) => {
  const { primitiveFilter, setPrimitiveFilter, taskResult } =
    useContext(TaskContext)!;

  const { offset: paginationOffset, limit: paginationLimit } =
    primitiveFilter[primitiveType].pagination;

  const depsAmount = taskResult?.depsAmount || 1;

  const setOffset = (newOffset: number) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter[primitiveType].pagination.offset = clamp(
        newOffset,
        0,
        depsAmount
      );
      return newFilter;
    });

  const goToPreviousPage = () => setOffset(paginationOffset - paginationLimit);
  const goToNextPage = () => setOffset(paginationOffset + paginationLimit);

  return (
    <div className="w-100 d-flex justify-content-center align-items-center">
      <Button
        onClick={goToPreviousPage}
        variant="primary"
        enabled={paginationOffset > 1}
      >
        <i className="bi bi-chevron-left" />
      </Button>
      <p className="mb-0 mx-2 fs-5">
        {paginationOffset + 1}-
        {Math.min(paginationOffset + paginationLimit, depsAmount)}
      </p>
      <Button
        onClick={goToNextPage}
        variant="primary"
        enabled={paginationOffset + paginationLimit < depsAmount}
      >
        <i className="bi bi-chevron-right" />
      </Button>
    </div>
  );
};

export default Pagination;
