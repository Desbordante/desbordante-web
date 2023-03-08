import { useQuery } from '@apollo/client';
import { FC } from 'react';
import { FieldValues, useFormContext } from 'react-hook-form';
import {
  getCountOfColumns,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns';
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';
import { showError } from '@utils/toasts';
import { FormConfig, FormProps } from 'types/configurator';
import { MainPrimitiveType } from 'types/globalTypes';

type MFDFields = {
  algorithmName: 'MetricVerification'; // constant
  lhsIndices: number[];
  rhsIndices: number[];
  rhsColumnType: any; // client-side
  metric: any;
  metricAlgorithm: any;
  parameter: number; //toleranceParameter
  q: number; // qgramLength
  distanceToNullIsInfinity: any;
};

const formDefaults = {
  algorithmName: 'MetricVerification', // constant
  lhsIndices: [],
  rhsIndices: [],
  rhsColumnType: 'Numeric', // client-side
  metric: 'EUCLIDEAN',
  metricAlgorithm: 'BRUTE',
  parameter: 1.0, //toleranceParameter
  q: 1, // qgramLength
  distanceToNullIsInfinity: true,
} as MFDFields;

type MFDFormProps = FormProps<MFDFields>;

const MFDFormComponent: FC<MFDFormProps> = ({
  control,
  watch,
  setValue,
  fileID,
}) => {
  const { control, watch, setValue } = useFormContext();

  const { loading, error, data } = useQuery<
    getCountOfColumns,
    getCountOfColumnsVariables
  >(GET_COUNT_OF_COLUMNS, {
    variables: { fileID: fileID },
    onError: (error) => {
      showError(
        error.message,
        "Can't fetch columns information. Please try later."
      );
    },
  });

  // TODO: Add logic for form
};

const MFDForm: FormConfig<MFDFormProps, MFDFields> = {
  primitiveType: MainPrimitiveType.MFD,
  form: MFDFormComponent,
  formDefaults,
} as const;

export type { MFDFields };
export default MFDForm;
