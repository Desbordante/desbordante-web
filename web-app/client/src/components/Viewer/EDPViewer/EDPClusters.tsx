import React, { useContext } from "react";

import Cluster from "./Cluster";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";
import EmptyState from "../../EmptyState/EmptyState";
import { ClustersContext } from "./ClustersContext";

const EDPClusters: React.FC = () => {
  const { clusters } = useContext(ClustersContext)!;

  return (
    <LoadingContainer isLoading={!clusters?.TypoClusters}>
      <>
        {clusters?.TypoClusters.length ? (
          clusters!.TypoClusters.map(({ id }) => (
            <>
              <Cluster id={id} key={id} />
              <Cluster id={id} key={id} />
              <Cluster id={id} key={id} />
              <Cluster id={id} key={id} />
              <Cluster id={id} key={id} />
              <Cluster id={id} key={id} />
            </>
          ))
        ) : (
          <EmptyState primitive="cluster" />
        )}
      </>
    </LoadingContainer>
  );
};

export default EDPClusters;
