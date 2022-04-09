import React from "react";
import TableSnippet from "../TableSnippet/TableSnippet";

interface Props {
  isExpanded?: boolean;
}

const Cluster: React.FC<Props> = ({ isExpanded = false }) => {
  return <TableSnippet />;
};

export default Cluster;
