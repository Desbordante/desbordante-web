import React, { useContext } from "react";
import Button from "../Button/Button";
import clamp from "../../functions/clamp";
import { TaskContext } from "../TaskContext";

const Pagination: React.FC = () => {
  const { intersectionFilter, setIntersectionFilter, taskResult } =
    useContext(TaskContext)!;

  const { offset: paginationOffset, limit: paginationLimit } =
    intersectionFilter.pagination;

  const depsAmount = taskResult?.filteredDeps?.filteredDepsAmount || 1;

  const setOffset = (offset: number) =>
    setIntersectionFilter((filter) => ({
        ...filter,
        pagination: {
          ...filter.pagination,
          offset: clamp(offset, 0, depsAmount),
        }
      }));

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
