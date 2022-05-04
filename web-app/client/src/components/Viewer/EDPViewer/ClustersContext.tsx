import React, { createContext, useState } from "react";
import { useClusters } from "../../../hooks/useClusters";
import { FunctionalDependency } from "../../../types/taskInfo";
import { ClustersInfo } from "../../../types/primitives";

type ClustersContextType = {
  selectedDependency: FunctionalDependency | undefined;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<FunctionalDependency | undefined>
  >;
  clusters: ClustersInfo | undefined;
  startSpecificTask: (clusterId: number) => void;
  setClusterSorted: (clusterId: number, isSorted: boolean) => void;
};

export const ClustersContext = createContext<ClustersContextType | null>(null);

export const ClustersContextProvider: React.FC = ({ children }) => {
  const [selectedDependency, setSelectedDependency] =
    useState<FunctionalDependency>();
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
