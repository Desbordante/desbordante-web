import React, { useContext } from "react";

import { AlgorithmProps } from "../../../types/algorithmProps";
import { PrimitiveType } from "../../../types/types";
import Toggle from "../../Toggle/Toggle";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import FDAlgorithmProps from "./FDAlgorithmProps";
import CFDAlgorithmProps from "./CFDAlgorithmProps";
import ARAlgorithmProps from "./ARAlgorithmProps";
import EDPAlgorithmProps from "./EDPAlgorithmProps";
import { FileFormContext } from "../../FileFormContext";

const ChooseAlgorithmProps = () => {
  const { primitiveType } = useContext(FileFormContext)!;

  return (
    <>
      {primitiveType === "Functional Dependencies" && <FDAlgorithmProps />}
      {primitiveType === "Conditional Functional Dependencies" && (
        <CFDAlgorithmProps />
      )}
      {primitiveType === "Association Rules" && <ARAlgorithmProps />}
      {primitiveType === "Error Detection Pipeline" && <EDPAlgorithmProps />}
    </>
  );
};

export default ChooseAlgorithmProps;
