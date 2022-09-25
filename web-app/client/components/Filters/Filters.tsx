import React, { useState, useEffect } from "react";

export const useFilters = () => {
  const [search, setSearch] = useState("");
  return { search, setSearch };
};
