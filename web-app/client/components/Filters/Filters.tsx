import React, { useState, useEffect } from "react";

export const useFilters = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  return { search, setSearch, page, setPage };
};
