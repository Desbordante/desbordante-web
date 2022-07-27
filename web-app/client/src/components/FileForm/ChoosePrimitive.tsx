import React, {useContext} from "react";
import {FileFormContext} from "../FileFormContext";
import Toggle from "../Toggle/Toggle";
import {MainPrimitiveType} from "../../types/globalTypes";

const tabs = [
  { alias: MainPrimitiveType.FD, name: "Functional Dependencies" },
  { alias: MainPrimitiveType.CFD, name: "Conditional Functional Dependencies" },
  { alias: MainPrimitiveType.AR, name: "Association Rules" },
  { alias: MainPrimitiveType.TypoFD, name: "Error Detection Pipeline" },
];

const ChoosePrimitive = () => {
  const { primitiveType, setPrimitiveType } = useContext(FileFormContext)!;

  return (
    <div className="w-100 text-center py-3">
      {tabs.map(({ alias, name }) => (
        <Toggle
          className="mx-2 my-2"
          key={alias}
          toggleCondition={primitiveType === alias}
          onClick={() => setPrimitiveType(alias)}
        >
          {name}
        </Toggle>
      ))}
    </div>
  );
};

export default ChoosePrimitive;
