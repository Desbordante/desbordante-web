import { FC, useState } from 'react';
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Controller,
} from 'react-hook-form';
import _ from 'lodash';
import Button from '@components/Button';
import { Checkbox, Select, Text } from '@components/Inputs';
import { Tab, TabView } from '@components/TabView/TabView';
import { FileProps } from 'types/globalTypes';
import Tooltip from '@components/Tooltip';
import styles from './FilePropsView.module.scss';

type Props = {
  data: FileProps;
  onClose?: () => void;
};

type FormProps = {
  switchEdit?: () => void;
  onDelete?: () => void;
};

const FilePropsList: FC<Props & FormProps> = ({
  data,
  onDelete,
  switchEdit,
}) => {
  const separators = {
    ',': 'Comma ","',
    ';': 'semicolon ";"',
    '|': 'Pipe "|"',
  };
  return (
    <>
      <div className={styles.propsList}>
        <div>
          <p>
            File type{' '}
            <Tooltip>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua
            </Tooltip>
          </p>
          <p>{data.fileType || 'CSV'}</p>
        </div>
        <div>
          <p>Separator</p>
          <p>{_.get(separators, data.delimiter, data.delimiter)}</p>
        </div>
        <div>
          <p>Has header row</p>
          <p>{data.hasHeader ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <p>
            Itemset format{' '}
            <Tooltip>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua
            </Tooltip>
          </p>
          <p>{data.inputFormat}</p>
        </div>
        <div>
          <p>ID column index</p>
          <p>{data.tidColumnIndex}</p>
        </div>
        <div>
          <p>Itemset column index</p>
          <p>{data.itemColumnIndex}</p>
        </div>
      </div>
      <div className={styles.buttonsRow}>
        <Button variant="secondary-error" onClick={onDelete}>
          Delete
        </Button>
        <Button variant="primary" onClick={switchEdit}>
          Edit
        </Button>
      </div>
    </>
  );
};

const FilePropsForm: FC<Props & FormProps> = ({ data, switchEdit }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: data });
  const onSubmit: SubmitHandler<FieldValues> = (data) =>
    switchEdit && switchEdit();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name={'fileType'}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="File type"
            options={[{ value: 'CSV', label: 'CSV' }]}
          />
        )}
      />
      <Controller
        name="delimiter"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Separator"
            options={[{ value: ',', label: 'Comma (",")' }]}
          />
        )}
      />
      <Checkbox label="Has header row" {...register('hasHeader')} />
      <Controller
        name="inputFormat"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Itemset format"
            options={[
              { value: 'SINGULAR', label: 'Singular' },
              { value: 'TABULAR', label: 'Tabular' },
            ]}
          />
        )}
      />
      <div className={styles.fieldsRow}>
        <Text label="ID column index" {...register('tidColumnIndex')} />
        <Text label="Itemset column index" {...register('itemColumnIndex')} />
      </div>
      <div className={styles.buttonsRow}>
        <Button variant="secondary" onClick={switchEdit}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      </div>
    </form>
  );
};
const FilePropsView: FC<Props> = ({ data, onClose }) => {
  const [isEdited, setIsEdited] = useState(false);
  const switchEdit = () => setIsEdited((isEdited) => !isEdited);
  return (
    <div className={styles.container}>
      <h4>File Properties</h4>
      <TabView>
        <Tab name="Properties">
          {!isEdited && (
            <FilePropsList
              onDelete={onClose}
              switchEdit={switchEdit}
              data={data}
            />
          )}
          {isEdited && <FilePropsForm switchEdit={switchEdit} data={data} />}
        </Tab>
        <Tab name="Statistics">
          <div className={styles.stats}>
            <p>Statistics are not available yet</p>
          </div>
        </Tab>
      </TabView>
    </div>
  );
};

export default FilePropsView;
