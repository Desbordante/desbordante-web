import React from "react";

const primitiveNamesForTitle = {
  dependency: "dependencies",
  cluster: "clusters",
};

const suggestions = {
  dependency: "Start a task with different configuration",
  cluster:
    "Choose another dependency or start a task with different configuration",
};

interface Props {
  primitive: "dependency" | "cluster";
}

const EmptyState: React.FC<Props> = ({ primitive }) => (
  <div className="w-100 h-100 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
    <h1 className="text-muted">No {primitiveNamesForTitle[primitive]} found</h1>
    <p className="text-muted">{suggestions[primitive]}</p>
  </div>
);

export default EmptyState;
