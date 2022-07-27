import React, { useContext } from "react";
import { Stack } from "react-bootstrap";

import _ from "lodash";
import FDSnippet from "./FDSnippet";
import { MainPrimitiveType } from "../../../types/globalTypes";
import { TaskContext } from "../../TaskContext";
import { FD} from "../../../graphql/operations/fragments/__generated__/FD";
import List, { getDepsFromTaskResult, pluralizeDep, SpecificListProps } from "../List";
import { RealPrimitiveType } from "../../../types/primitives";

const FDList: React.FC<SpecificListProps<FD>> = ({
                                   selectedDependency,
                                   setSelectedDependency,
                                   className = "",
                                 }) => {
  const {taskResult} = useContext(TaskContext)!;
  const primitiveType: RealPrimitiveType = MainPrimitiveType.FD;
  const deps = getDepsFromTaskResult(taskResult, pluralizeDep(primitiveType));
  return (
    <List type={primitiveType} className={className} withWithoutKeys={true}>
      <Stack className="my-2">
        {deps.map((dep, index) => (
          <FDSnippet
            dependency={dep}
            key={index}
            onClick={() => {
              setSelectedDependency(dep);
            }}
            onActiveClick={() => {
              setSelectedDependency(null);
            }}
            isActive={_.isEqual(dep, selectedDependency)}
          />
        ))}
      </Stack>
    </List>
  );
};

export default FDList;
