import React, { useContext, useState } from "react";
import { Stack } from "react-bootstrap";

import _ from "lodash";
import CFDSnippet from "./CFDSnippet";
import { TaskContext } from "../../TaskContext";
import { CFD } from "../../../graphql/operations/fragments/__generated__/CFD";
import { MainPrimitiveType } from "../../../types/globalTypes";
import List, { getDepsFromTaskResult, pluralizeDep, SpecificListProps } from "../List";
import { RealPrimitiveType } from "../../../types/primitives";


const CFDList: React.FC<SpecificListProps<CFD>> = ({
                                                     selectedDependency,
                                                     setSelectedDependency,
                                                     className = "",
                                                   }) => {
  const { taskResult } = useContext(TaskContext)!;
  const primitiveType: RealPrimitiveType = MainPrimitiveType.CFD;
  const deps = getDepsFromTaskResult(taskResult, pluralizeDep(primitiveType));

  const [isPatternShown, setIsPatternShown] = useState(true);

  return (
    <List type={primitiveType} withWithoutKeys={true} className={className}
          patternButtonProps={{setIsPatternShown, isPatternShown}}>
      <Stack className="my-2">
        {deps.map((dep, index) => (
          <CFDSnippet
            dependency={dep}
            key={index}
            isPatternShown={isPatternShown}
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

export default CFDList;
