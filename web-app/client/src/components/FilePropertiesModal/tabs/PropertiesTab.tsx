import { useQuery } from '@apollo/client';
import _ from 'lodash';
import { FC, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from '@components/Button';
import { Checkbox, Text } from '@components/Inputs';
import { ControlledSelect } from '@components/Inputs/Select';
import delimiterNames from '@constants/delimiterNames';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import { AllowedDataset } from 'types/algorithms';
import {
  FileProps,
  InputFileFormat,
  MainPrimitiveType,
} from 'types/globalTypes';
import styles from '../FilePropertiesModal.module.scss';

interface PropertyListProps {
  data: AllowedDataset;
}

export const FilePropsList: FC<PropertyListProps> = ({ data }) => {
  return (
    <div className={styles.propsList}>
      <div>
        <p>Separator</p>
        <p>{_.get(delimiterNames, data.delimiter, data.delimiter)}</p>
      </div>
      <div>
        <p>Has header row</p>
        <p>{data.hasHeader ? 'Yes' : 'No'}</p>
      </div>

      {data.fileFormat && (
        <>
          <div>
            <p>Itemset format</p>
            <p>{data.fileFormat.inputFormat}</p>
          </div>
          {data.fileFormat.inputFormat === 'SINGULAR' ? (
            <>
              <div>
                <p>ID column index</p>
                <p>{data.fileFormat.tidColumnIndex}</p>
              </div>
              <div>
                <p>Itemset column index</p>
                <p>{data.fileFormat.itemColumnIndex}</p>
              </div>
            </>
          ) : (
            <div>
              <p>Has transaction ID</p>
              <p>{data.fileFormat.hasTid ? 'Yes' : 'No'}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const fileFormatOptions = [
  { value: 'SINGULAR', label: 'Singular' },
  { value: 'TABULAR', label: 'Tabular' },
];

const defaultValues = {
  hasHeader: true,
  delimiter: ',',
  inputFormat: InputFileFormat.SINGULAR,
  tidColumnIndex: 1,
  itemColumnIndex: 2,
  hasTid: true,
};

interface PropertyFormProps {
  onSubmit: (data: FileProps) => void;
  onClose?: () => void;
}

export const FilePropsForm: FC<PropertyFormProps> = ({ onSubmit, onClose }) => {
  const { primitive } = useTaskUrlParams();
  const { register, handleSubmit, control, watch, setValue, reset } =
    useForm<FileProps>({
      defaultValues,
    });
  const { data } = useQuery<getAlgorithmsConfig>(GET_ALGORITHMS_CONFIG);

  const delimiterOptions = useMemo(
    () =>
      data?.algorithmsConfig.fileConfig.allowedDelimiters.map((delimiter) => ({
        label:
          delimiter in delimiterNames
            ? delimiterNames[delimiter as keyof typeof delimiterNames]
            : delimiter,
        value: delimiter,
      })),
    [data?.algorithmsConfig.fileConfig.allowedDelimiters],
  );

  const inputFormat = watch('inputFormat');

  useEffect(() => {
    if (primitive.value !== MainPrimitiveType.AR) {
      setValue('inputFormat', undefined);
      setValue('tidColumnIndex', undefined);
      setValue('itemColumnIndex', undefined);
      setValue('hasTid', undefined);
    } else {
      reset(defaultValues);
    }
  }, [primitive.value, reset, setValue]);

  useEffect(() => {
    if (inputFormat === 'SINGULAR') {
      setValue('tidColumnIndex', 1);
      setValue('itemColumnIndex', 2);
      setValue('hasTid', undefined);
    } else {
      setValue('tidColumnIndex', undefined);
      setValue('itemColumnIndex', undefined);
      setValue('hasTid', true);
    }
  }, [inputFormat, setValue]);

  const submitAndClose: SubmitHandler<FileProps> = async (values) => {
    onSubmit(values);
    onClose && onClose();
  };

  return (
    <form
      onSubmit={handleSubmit(submitAndClose)}
      className={styles.formContainer}
    >
      <ControlledSelect
        controlName="delimiter"
        control={control}
        label="Separator"
        options={delimiterOptions}
      />
      <Checkbox label="Has header row" {...register('hasHeader')} />
      {primitive.value === MainPrimitiveType.AR && (
        <>
          <ControlledSelect
            controlName="inputFormat"
            control={control}
            label="Itemset format"
            options={fileFormatOptions}
          />
          {inputFormat === 'SINGULAR' ? (
            <div className={styles.fieldsRow}>
              <Text
                label="ID column index"
                {...register('tidColumnIndex', {
                  valueAsNumber: true,
                })}
              />
              <Text
                label="Itemset column index"
                {...register('itemColumnIndex', {
                  valueAsNumber: true,
                })}
              />
            </div>
          ) : (
            <Checkbox label="Has transaction ID" {...register('hasTid')} />
          )}
        </>
      )}

      <div className={styles.buttonsRow}>
        <Button variant="secondary" onClick={onClose} type="reset">
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};
