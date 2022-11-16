import { FC, useEffect, useReducer, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import _ from 'lodash';
import Button from '@components/Button';
import { Checkbox, Select, Text } from '@components/Inputs';
import { Tab, TabView } from '@components/TabView/TabView';
import { FileProps } from 'types/globalTypes';
import Tooltip from '@components/Tooltip';
import styles from './FilePropsView.module.scss';
import { Alert } from '@components/FileStats/Alert';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import { Progress } from '@components/FileStats/Progress';
import { Table } from '@components/FileStats/Table';
import { ColumnCard } from '@components/FileStats/ColumnCard';
import { useRouter } from 'next/router';
import { OptionWithBadge } from '@components/FilePropsView/OptionWithBadge';
import { Menu } from '@components/FilePropsView/Menu';
import { useMutation, useQuery } from '@apollo/client';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import {
  getFileStats,
  getFileStatsVariables,
} from '@graphql/operations/queries/__generated__/getFileStats';
import { getOverview } from '@utils/fileStats';
import { START_PROCESSING_STATS } from '@graphql/operations/mutations/startProcessingStats';
import {
  startProcessingStats,
  startProcessingStatsVariables,
} from '@graphql/operations/mutations/__generated__/startProcessingStats';
import classNames from 'classnames';

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
            File type
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

        {data.fileType === 'Itemset' && (
          <>
            <div>
              <p>
                Itemset format
                <Tooltip>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
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
          </>
        )}
      </div>
      <div className={styles.buttonsRow}>
        <Button variant="secondary-danger" onClick={onDelete}>
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
    formState: { errors },
  } = useForm({ defaultValues: data });
  const onSubmit: SubmitHandler<FileProps> = (data) =>
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
      {data.fileType === 'Itemset' && (
        <>
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
            <Text
              label="Itemset column index"
              {...register('itemColumnIndex')}
            />
          </div>
        </>
      )}

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

export type ColumnOption = {
  value: number;
  label: string;
  type?: string;
  categorical?: boolean;
};

enum Stage {
  Start,
  Processing,
  Show,
}

type StatsTabProps = {
  fileId: string;
};

const StatsTab: FC<StatsTabProps> = ({ fileId }: StatsTabProps) => {
  const router = useRouter();
  const [threadsCount, setThreadsCount] = useState(1);
  const [stage, setStage] = useState<Stage | null>(null);
  const [selectedColumn, setSelectedColumn] = useState(-1);

  const {
    data: fileStats,
    startPolling,
    stopPolling,
  } = useQuery<getFileStats, getFileStatsVariables>(GET_FILE_STATS, {
    variables: {
      fileID: fileId,
    },
    onCompleted: (fileStats) => {
      const file = fileStats?.datasetInfo;
      if (!file) return;

      if (!file.hasStats) return setStage(Stage.Start);

      if (file.statsProgress !== 100) return setStage(Stage.Processing);

      return setStage(Stage.Show);
    },
  });

  const [startProcessingStats] = useMutation<
    startProcessingStats,
    startProcessingStatsVariables
  >(START_PROCESSING_STATS, {
    onCompleted: () => setStage(Stage.Processing),
  });

  useEffect(() => {
    if (stage === Stage.Processing) startPolling?.(1000);

    if (stage === Stage.Show) stopPolling?.();
  }, [stage]);

  const file = fileStats?.datasetInfo;

  if (!file)
    return (
      <div className={styles.loading}>
        <h5>Loading...</h5>
      </div>
    );

  const startProcessing = (
    <>
      <Alert>
        Statistics have not been processed yet.
        <br />
        Would you like to start processing?
      </Alert>
      <NumberSlider
        sliderProps={{ min: 1, max: 9, step: 1 }}
        label="Thread count"
        value={threadsCount}
        onChange={(value) => setThreadsCount(Math.round(value))}
      />
    </>
  );

  const processing = (
    <>
      <div className={styles.processing}>
        <div className={styles['processing-label']}>
          <span>Discovering statistics</span>
          <span>{file.statsProgress}%</span>
        </div>
        <Progress value={file.statsProgress} />
      </div>
    </>
  );

  const overview = (
    <Table>
      <tbody>
        {getOverview(file).map((item) => (
          <tr key={item.name}>
            <th>{item.name}</th>
            <td>{item.value}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const options: ColumnOption[] = [
    { value: -1, label: 'Overview' },
    ...file.stats.map((column) => ({
      value: column.columnIndex,
      label: column.columnName ?? '',
      type: column.type ?? '',
      categorical: !!column.isCategorical,
    })),
  ];

  const columns = (
    <>
      <div className={styles['header-with-select']}>
        <h5>Columns</h5>
        <Select
          isSearchable={false}
          value={options.find((option) => option.value === selectedColumn)}
          onChange={(e) => setSelectedColumn((e as ColumnOption).value)}
          options={options}
          components={{ Option: OptionWithBadge, Menu }}
        />
      </div>

      {selectedColumn === -1 && overview}
      {selectedColumn !== -1 && (
        <ColumnCard
          column={
            file.stats.find((column) => column.columnIndex === selectedColumn)!
          }
          compact
        />
      )}
    </>
  );

  return (
    <>
      <div className={styles.stats}>
        {stage === Stage.Start && startProcessing}
        {stage === Stage.Processing && processing}
        {stage === Stage.Show && columns}
      </div>
      <div className={styles.buttonsRow}>
        {stage !== Stage.Show && (
          <Button
            disabled={stage !== Stage.Start}
            onClick={() =>
              startProcessingStats({
                variables: { fileID: fileId, threadsCount },
              })
            }
          >
            Start Processing
          </Button>
        )}
        {stage === Stage.Show && (
          <Button
            onClick={() =>
              router.push(`/create-task/file-stats?fileId=${fileId}`)
            }
          >
            Show More
          </Button>
        )}
      </div>
    </>
  );
};

const FilePropsView: FC<Props & { fileId: string }> = ({
  fileId,
  data,
  onClose,
}) => {
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
          <StatsTab fileId={fileId} />
        </Tab>
      </TabView>
    </div>
  );
};

export default FilePropsView;
