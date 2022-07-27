import React, { useContext } from "react";
import { Stack } from "react-bootstrap";

import _ from "lodash";
import { TaskContext } from "../../TaskContext";
import { ClustersContext } from "./ClustersContext";
import { MainPrimitiveType } from "../../../types/globalTypes";
import List, { getDepsFromTaskResult, pluralizeDep } from "../List";
import { RealPrimitiveType } from "../../../types/primitives";
import FDSnippet from "../FDViewer/FDSnippet";

interface Props {
  className?: string;
}

const EDPList: React.FC<Props> = ({ className = "" }) => {
  const { selectedDependency, setSelectedDependency } = useContext(ClustersContext)!;
  const { taskResult } = useContext(TaskContext)!;
  const primitiveType: RealPrimitiveType = MainPrimitiveType.FD;
  const deps = getDepsFromTaskResult(taskResult, pluralizeDep(primitiveType));

  return (
    <List type={ primitiveType } className={ className } withWithoutKeys={ true }>
        <Stack className="my-2">
          {deps.map((dep, index) => (
            <FDSnippet
              dependency={dep}
              key={index}
              onClick={() => {
                setSelectedDependency(dep);
              }}
              onActiveClick={() => {
                setSelectedDependency(undefined);
              }}
              isActive={_.isEqual(dep, selectedDependency)}
            />
          ))}
        </Stack>
    </List>
  );
};
export default EDPList;
