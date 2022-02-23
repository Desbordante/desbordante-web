import React, { useContext, useEffect } from "react";

import { CFDAlgorithm } from "../../../types/types";
import Value from "../../Value/Value";
import Slider from "../../Slider/Slider";
import Toggle from "../../Toggle/Toggle";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import { FileFormContext } from "../../FileFormContext";

const CFDAlgorithmProps = () => {
  const { algorithmProps, setAlgorithmProps } = useContext(FileFormContext)!;
  const { validators, allowedValues } = useContext(AlgorithmConfigContext)!;

  const changeAlgorithm = (newAlgorithm: CFDAlgorithm) => {
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      algorithm: newAlgorithm,
    }));
  };

  const changeMinConfidence = (newMinConfidence: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      minConfidence: newMinConfidence,
    }));
  };

  const changeArityConstant = (newArityConstant: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      arityConstant: newArityConstant,
    }));
  };

  const changeMinSupport = (newMinSupport: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      minSupport: newMinSupport,
    }));
  };

  useEffect(() => changeMinSupport("2"), []);

  useEffect(() => {
    if (allowedValues.allowedAlgorithms?.allowedCFDAlgorithms[0]) {
      changeAlgorithm(allowedValues.allowedAlgorithms?.allowedCFDAlgorithms[0]);
    }
  }, [allowedValues]);

  const minConfidence = algorithmProps?.minConfidence || "0.005";
  const arityConstant = algorithmProps?.arityConstant || "5";
  const minSupport = algorithmProps?.minSupport || "2";

  return (
    <>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Algorithm:</h5>
        <div className="d-flex flex-wrap align-items-center">
          {allowedValues.allowedAlgorithms?.allowedCFDAlgorithms.map((algo) => (
            <Toggle
              onClick={() => changeAlgorithm(algo)}
              toggleCondition={algorithmProps?.algorithm === algo}
              key={algo.name}
              className="mx-2"
            >
              {algo.name}
            </Toggle>
          ))}
        </div>
      </FormItem>
      <FormItem enabled={algorithmProps?.algorithm?.properties.hasConfidence}>
        <h5 className="text-white mb-0 mx-2">Minimum confidence:</h5>
        <Value
          value={minConfidence}
          onChange={changeMinConfidence}
          size={8}
          inputValidator={validators.isBetweenZeroAndOne}
          className="mx-2"
        />
        <Slider
          value={minConfidence}
          onChange={changeMinConfidence}
          step={1e-6}
          className="mx-2"
        />
      </FormItem>
      <FormItem
        enabled={algorithmProps?.algorithm?.properties.hasArityConstraint}
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
      <FormItem enabled={algorithmProps?.algorithm?.properties.hasSupport}>
        <h5 className="text-white mb-0 mx-2">Minimum support:</h5>
        <Value
          value={minSupport}
          onChange={changeMinSupport}
          size={2}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={minSupport}
          min={1}
          max={16}
          onChange={changeMinSupport}
          step={1}
          className="mx-2"
        />
      </FormItem>
    </>
  );
};

export default CFDAlgorithmProps;
