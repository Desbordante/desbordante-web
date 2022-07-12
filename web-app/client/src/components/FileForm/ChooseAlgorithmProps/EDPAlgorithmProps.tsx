import React, { useContext, useEffect } from "react";
import { sentenceCase } from "change-case";

import { EDPAlgorithm, FDAlgorithm } from "../../../types/types";
import Value from "../../Value/Value";
import Slider from "../../Slider/Slider";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import { FileFormContext } from "../../FileFormContext";
import Selector from "../../Selector/Selector";
import { MetricType } from "../../../types/globalTypes";

const EDPAlgorithmProps = () => {
  const { algorithmProps, setAlgorithmProps } = useContext(FileFormContext)!;
  const { validators, allowedValues } = useContext(AlgorithmConfigContext)!;

  const changeAlgorithm = (algorithm: EDPAlgorithm) =>
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      algorithm,
    }));

  const changePreciseAlgorithm = (preciseAlgorithm: FDAlgorithm) =>
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      preciseAlgorithm,
    }));

  const changeApproximateAlgorithm = (approximateAlgorithm: FDAlgorithm) =>
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      approximateAlgorithm,
    }));

  const changeErrorThreshold = (errorThreshold: string) =>
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      errorThreshold,
    }));

  const changeArityConstraint = (arityConstraint: string) =>
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      arityConstraint,
    }));

  const changeThreadsCount = (threadsCount: string) =>
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      threadsCount,
    }));

  const changeMetric = (metric: MetricType) =>
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      metric,
    }));

  const changeRadius = (radius: string) =>
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      radius,
    }));

  const changeRatio = (ratio: string) =>
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      ratio,
    }));

  useEffect(() => {
    if (allowedValues.allowedAlgorithms?.allowedFDAlgorithms[0]) {
      changePreciseAlgorithm(
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

  useEffect(() => {
    changeAlgorithm({
      name: "Typo Miner",
      properties: {
        hasArityConstraint: true,
        hasRadius: true,
        hasErrorThreshold: true,
        isMultiThreaded: true,
        hasMetric: true,
        hasRatio: true,
      },
    });
  }, []);

  const {
    errorThreshold, arityConstraint, threadsCount, metric, defaultRadius, defaultRatio
  } = algorithmProps;

  return (
    <>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Precise algorithm:</h5>
        <Selector
          options={
            allowedValues.allowedAlgorithms?.allowedFDAlgorithms.filter(
              (algo) => !algo.properties.hasErrorThreshold
            ) || []
          }
          current={
            algorithmProps.preciseAlgorithm || {
              name: "",
              properties: {
                hasArityConstraint: true,
                hasErrorThreshold: true,
                isMultiThreaded: true,
              },
            }
          }
          onSelect={changePreciseAlgorithm}
          label={(algo) => algo.name}
          className="mx-2"
        />
      </FormItem>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Approximate algorithm:</h5>
        <Selector
          options={
            allowedValues.allowedAlgorithms?.allowedFDAlgorithms.filter(
              (algo) => algo.name === "Pyro"
            ) || []
          }
          current={
            algorithmProps.approximateAlgorithm || {
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

      <FormItem>
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
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Arity constraint:</h5>
        <Value
          value={arityConstraint}
          onChange={changeArityConstraint}
          size={3}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={arityConstraint}
          min={1}
          max={10}
          onChange={changeArityConstraint}
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

      {/* <FormItem enabled={algorithmProps.algorithm?.properties.hasMetric}>
        <h5 className="text-white mb-0 mx-2">Metric:</h5>
        <Selector
          options={[MetricType.MODULUS_OF_DIFFERENCE, MetricType.LEVENSHTEIN]}
          current={metric}
          onSelect={changeMetric}
          label={sentenceCase}
          className="mx-2"
        />
      </FormItem> */}
      <FormItem enabled={algorithmProps.algorithm?.properties.hasRadius}>
        <h5 className="text-white mb-0 mx-2">Default radius:</h5>
        <Value
          value={defaultRadius}
          onChange={changeRadius}
          size={3}
          inputValidator={validators.isPositive}
          className="mx-2"
        />
        <Slider
          value={defaultRadius}
          min={1}
          max={10}
          onChange={changeRadius}
          step={0.001}
          className="mx-2"
        />
      </FormItem>
      <FormItem enabled={algorithmProps.algorithm?.properties.hasRatio}>
        <h5 className="text-white mb-0 mx-2">Default ratio:</h5>
        <Value
          value={defaultRatio}
          onChange={changeRatio}
          size={3}
          inputValidator={validators.isBetweenZeroAndOne}
          className="mx-2"
        />
        <Slider
          value={defaultRatio}
          min={0}
          max={1}
          onChange={changeRatio}
          step={0.001}
          className="mx-2"
        />
      </FormItem>
    </>
  );
};

export default EDPAlgorithmProps;
