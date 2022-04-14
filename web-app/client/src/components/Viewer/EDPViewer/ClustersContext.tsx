import React, { createContext, useCallback, useState } from "react";
import { useClusters } from "../../../hooks/useClusters";
import { FunctionalDependency } from "../../../types/taskInfo";
import {Cluster, ClustersInfo} from "../../../types/primitives";

type ClustersContextType = {
  selectedDependency: FunctionalDependency | undefined;
  setSelectedDependency: React.Dispatch<React.SetStateAction<FunctionalDependency | undefined>>;
  clusters: ClustersInfo | undefined;
  setCluster: (clusterId: number, newCluster: Cluster) => void;
};

export const ClustersContext = createContext<ClustersContextType | null>(null);

export const ClustersContextProvider: React.FC = ({ children }) => {
  const [selectedDependency, setSelectedDependency] =
    useState<FunctionalDependency>();
  const { clusters, setCluster } = useClusters(selectedDependency);

  const outValue = {
    selectedDependency,
    setSelectedDependency,
    clusters,
    setCluster,
  };

  return (
    <ClustersContext.Provider value={outValue}>
      {children}
    </ClustersContext.Provider>
  );
};
