import React, {useContext} from "react";
import {Stack} from "react-bootstrap";

import _ from "lodash";
import ARSnippet from "./ARSnippet";
import {TaskContext} from "../../TaskContext";
import {MainPrimitiveType} from "../../../types/globalTypes";
import {AR} from "../../../graphql/operations/fragments/__generated__/AR";
import List, {getDepsFromTaskResult, pluralizeDep, SpecificListProps} from "../List";
import {RealPrimitiveType} from "../../../types/primitives";

const ARList: React.FC<SpecificListProps<AR>> = ({
                                   selectedDependency,
                                   setSelectedDependency,
                                   className = "",
                                 }) => {
  const {taskResult} = useContext(TaskContext)!;
  const primitiveType: RealPrimitiveType = MainPrimitiveType.AR;
  const deps = getDepsFromTaskResult(taskResult, pluralizeDep(primitiveType));

  return (
    <List type={primitiveType} className={className}>
        <Stack className="my-2 w-100">
          {deps.map((rule, index) => (
            <ARSnippet
              rule={rule}
              key={index}
              onActiveClick={() => {
                setSelectedDependency(null);
              }}
              onClick={() => setSelectedDependency(rule)}
              isActive={_.isEqual(rule, selectedDependency)}
            />
          ))}
        </Stack>
    </List>
  );
};


export default ARList;
