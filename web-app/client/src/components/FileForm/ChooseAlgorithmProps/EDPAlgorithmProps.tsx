import React, { useContext, useEffect } from "react";

import { FDAlgorithm } from "../../../types/types";
import Value from "../../Value/Value";
import Slider from "../../Slider/Slider";
import Toggle from "../../Toggle/Toggle";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import { FileFormContext } from "../../FileFormContext";
import Selector from "../../Selector/Selector";

const EDPAlgorithmProps = () => {
  const { algorithmProps, setAlgorithmProps } = useContext(FileFormContext)!;
  const { validators, allowedValues } = useContext(AlgorithmConfigContext)!;

  const changeExactAlgorithm = (newAlgorithm: FDAlgorithm) => {
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      exact: {
        ...prevProps?.exact,
        algorithm: newAlgorithm,
      },
    }));
  };

  const changeApproximateAlgorithm = (newAlgorithm: FDAlgorithm) => {
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      approximate: {
        ...prevProps?.approximate,
        algorithm: newAlgorithm,
      },
    }));
  };

  const changeErrorThreshold = (newThreshold: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      errorThreshold: newThreshold,
    }));
  };

  const changearityConstraint = (newarityConstraint: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      arityConstraint: newarityConstraint,
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
      changeExactAlgorithm(
        allowedValues.allowedAlgorithms?.allowedFDAlgorithms.filter(
          (algo) => !algo.properties.hasErrorThreshold
        )[0]
      );
      changeApproximateAlgorithm(
        allowedValues.allowedAlgorithms?.allowedFDAlgorithms.filter(
          (algo) => algo.properties.hasErrorThreshold
        )[0]
      );
    }
  }, [allowedValues]);

  const errorThreshold = algorithmProps?.errorThreshold || "0.005";
  const arityConstraint = algorithmProps?.arityConstraint || "5";
  const threadsCount = algorithmProps?.threadsCount || "2";

  return (
    <>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Exact algorithm:</h5>
        <Selector
          options={
            allowedValues.allowedAlgorithms?.allowedFDAlgorithms.filter(
              (algo) => !algo.properties.hasErrorThreshold
            ) || []
          }
          current={
            algorithmProps.exact?.algorithm || {
              name: "",
              properties: {
                hasArityConstraint: true,
                hasErrorThreshold: true,
                isMultiThreaded: true,
              },
            }
          }
          onSelect={changeExactAlgorithm}
          label={(algo) => algo.name}
          className="mx-2"
        />
      </FormItem>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Approximate algorithm:</h5>
        <Selector
          options={
            allowedValues.allowedAlgorithms?.allowedFDAlgorithms.filter(
              (algo) => algo.properties.hasErrorThreshold
            ) || []
          }
          current={
            algorithmProps.approximate?.algorithm || {
              name: "",
              properties: {
                hasArityConstraint: true,
                hasErrorThreshold: true,
                isMultiThreaded: true,
              },
            }
          }
          onSelect={changeApproximateAlgorithm}
          label={(algo) => algo.name}
          className="mx-2"
        />
      </FormItem>

      <FormItem
        enabled={algorithmProps?.algorithm?.properties.hasErrorThreshold}
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
        enabled={
          algorithmProps?.exact?.algorithm?.properties.hasArityConstraint &&
          algorithmProps?.approximate?.algorithm?.properties.hasArityConstraint
        }
      >
        <h5 className="text-white mb-0 mx-2">Arity constraint:</h5>
        <Value
          value={arityConstraint}
          onChange={changearityConstraint}
          size={3}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={arityConstraint}
          min={1}
          max={10}
          onChange={changearityConstraint}
          step={1}
          className="mx-2"
        />
      </FormItem>
      <FormItem enabled={algorithmProps?.algorithm?.properties.isMultiThreaded}>
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

export default EDPAlgorithmProps;
