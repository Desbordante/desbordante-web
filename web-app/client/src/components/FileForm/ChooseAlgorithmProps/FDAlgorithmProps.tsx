import React, { useContext, useEffect } from "react";

import { FDAlgorithm } from "../../../types/types";
import Value from "../../Value/Value";
import Slider from "../../Slider/Slider";
import Toggle from "../../Toggle/Toggle";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import { FileFormContext } from "../../FileFormContext";

const FDAlgorithmProps = () => {
  const { algorithmProps, setAlgorithmProps } = useContext(FileFormContext)!;
  const { validators, allowedValues } = useContext(AlgorithmConfigContext)!;

  const changeAlgorithm = (newAlgorithm: FDAlgorithm) => {
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      algorithm: newAlgorithm,
    }));
  };

  const changeErrorThreshold = (newThreshold: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      errorThreshold: newThreshold,
    }));
  };

  const changeArityConstant = (newArityConstant: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      arityConstant: newArityConstant,
    }));
  };

  const changeThreadsCount = (newThreadsCount: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      threadsCount: newThreadsCount,
    }));
  };

  useEffect(() => {
    if (allowedValues.allowedAlgorithms?.allowedFDAlgorithms[0]) {
      changeAlgorithm(allowedValues.allowedAlgorithms?.allowedFDAlgorithms[0]);
    }
  }, [allowedValues]);

  const errorThreshold = algorithmProps?.errorThreshold || "0.005";
  const arityConstant = algorithmProps?.arityConstant || "5";
  const threadsCount = algorithmProps?.threadsCount || "2";

  return (
    <>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Algorithm:</h5>
        <div className="d-flex flex-wrap align-items-center">
          {allowedValues.allowedAlgorithms?.allowedFDAlgorithms.map((algo) => (
            <Toggle
              onClick={() => changeAlgorithm(algo)}
              toggleCondition={algorithmProps.algorithm === algo}
              key={algo.name}
              className="mx-2"
            >
              {algo.name}
            </Toggle>
          ))}
        </div>
      </FormItem>
      <FormItem
        enabled={algorithmProps.algorithm?.properties.hasErrorThreshold}
      >
        <h5 className="text-white mb-0 mx-2">Error threshold:</h5>
        <Value
          value={errorThreshold}
          onChange={changeErrorThreshold}
          size={8}
          inputValidator={validators.isBetweenZeroAndOne}
          className="mx-2"
        />
        <Slider
          value={errorThreshold}
          onChange={changeErrorThreshold}
          step={1e-6}
          className="mx-2"
        />
      </FormItem>
      <FormItem
        enabled={algorithmProps.algorithm?.properties.hasArityConstraint}
      >
        <h5 className="text-white mb-0 mx-2">Arity constant:</h5>
        <Value
          value={arityConstant}
          onChange={changeArityConstant}
          size={3}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={arityConstant}
          min={1}
          max={10}
          onChange={changeArityConstant}
          step={1}
          className="mx-2"
        />
      </FormItem>
      <FormItem enabled={algorithmProps.algorithm?.properties.isMultiThreaded}>
        <h5 className="text-white mb-0 mx-2">Threads:</h5>
        <Value
          value={threadsCount}
          onChange={changeThreadsCount}
          size={2}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={threadsCount}
          min={1}
          max={16}
          onChange={changeThreadsCount}
          step={1}
          className="mx-2"
        />
      </FormItem>
    </>
  );
};

export default FDAlgorithmProps;
