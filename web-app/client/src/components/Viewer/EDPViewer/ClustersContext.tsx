import React, { createContext, useState } from "react";
import { useClusters } from "../../../hooks/useClusters";
import { ClustersInfo } from "../../../types/primitives";
import { FD } from "../../../graphql/operations/fragments/__generated__/FD";

type ClustersContextType = {
  selectedDependency: FD | undefined;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<FD | undefined>
  >;
  clusters: ClustersInfo | undefined;
  startSpecificTask: (clusterId: number) => void;
  setClusterSorted: (clusterId: number, isSorted: boolean) => void;
};

export const ClustersContext = createContext<ClustersContextType | null>(null);

export const ClustersContextProvider: React.FC = ({ children }) => {
  const [selectedDependency, setSelectedDependency] =
    useState<FD>();
  const { clusters, startSpecificTask, setClusterSorted } = useClusters(selectedDependency);

  const outValue = {
    selectedDependency,
    setSelectedDependency,
    clusters,
    startSpecificTask,
    setClusterSorted,
  };

  return (
    <ClustersContext.Provider value={outValue}>
      {children}
    </ClustersContext.Provider>
  );
};
