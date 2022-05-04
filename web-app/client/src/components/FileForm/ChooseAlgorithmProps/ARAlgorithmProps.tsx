import React, { useContext, useEffect } from "react";

import { ARAlgorithm } from "../../../types/types";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import { FileFormContext } from "../../FileFormContext";
import Value from "../../Value/Value";
import Slider from "../../Slider/Slider";
import Selector from "../../Selector/Selector";

const ARAlgorithmProps = () => {
  const { algorithmProps, setAlgorithmProps } = useContext(FileFormContext)!;
  const { allowedValues, validators } = useContext(AlgorithmConfigContext)!;

  const changeAlgorithm = (newAlgorithm: ARAlgorithm) => {
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

  const changeMinSupport = (newMinSupport: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      minSupportAR: newMinSupport,
    }));
  };

  useEffect(() => {
    if (allowedValues.allowedAlgorithms?.allowedARAlgorithms[0]) {
      changeAlgorithm(allowedValues.allowedAlgorithms?.allowedARAlgorithms[0]);
    }
  }, [allowedValues]);

  const { minConfidence, minSupportAR } = algorithmProps;

  return (
    <>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Algorithm:</h5>
        <Selector
          options={allowedValues.allowedAlgorithms?.allowedARAlgorithms || []}
          current={
            algorithmProps.algorithm || {
              name: "",
              properties: {
                hasConfidence: true,
                hasSupport: true,
              },
            }
          }
          onSelect={changeAlgorithm}
          label={(algo) => algo.name}
          className="mx-2"
        />
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
      <FormItem enabled={algorithmProps?.algorithm?.properties.hasSupport}>
        <h5 className="text-white mb-0 mx-2">Minimum support:</h5>
        <Value
          value={minSupportAR}
          onChange={changeMinSupport}
          size={8}
          inputValidator={validators.isBetweenZeroAndOne}
          className="mx-2"
        />
        <Slider
          value={minSupportAR}
          onChange={changeMinSupport}
          step={1e-6}
          className="mx-2"
        />
      </FormItem>
    </>
  );
};

export default ARAlgorithmProps;
