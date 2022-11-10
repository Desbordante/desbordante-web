import { FC, useReducer, useState } from "react";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Controller,
} from "react-hook-form";
import _ from "lodash";
import Button from "@components/Button";
import { Checkbox, Select, Text } from "@components/Inputs";
import { Tab, TabView } from "@components/TabView/TabView";
import { FileProps } from "types/globalTypes";
import Tooltip from "@components/Tooltip";
import styles from "./FilePropsView.module.scss";
import { Alert } from "@components/FileStats/Alert";
import NumberSlider from "@components/Inputs/NumberSlider/NumberSlider";
import { Progress } from "@components/FileStats/Progress";

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
    ",": 'Comma ","',
    ";": 'semicolon ";"',
    "|": 'Pipe "|"',
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
          <p>{data.fileType || "CSV"}</p>
        </div>
        <div>
          <p>Separator</p>
          <p>{_.get(separators, data.delimiter, data.delimiter)}</p>
        </div>
        <div>
          <p>Has header row</p>
          <p>{data.hasHeader ? "Yes" : "No"}</p>
        </div>

        {data.fileType === "Itemset" && (
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
        name={"fileType"}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="File type"
            options={[{ value: "CSV", label: "CSV" }]}
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
            options={[{ value: ",", label: 'Comma (",")' }]}
          />
        )}
      />
      <Checkbox label="Has header row" {...register("hasHeader")} />
      {data.fileType === "Itemset" && (
        <>
          <Controller
            name="inputFormat"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Itemset format"
                options={[
                  { value: "SINGULAR", label: "Singular" },
                  { value: "TABULAR", label: "Tabular" },
                ]}
              />
            )}
          />
          <div className={styles.fieldsRow}>
            <Text label="ID column index" {...register("tidColumnIndex")} />
            <Text
              label="Itemset column index"
              {...register("itemColumnIndex")}
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

const StatsTab: FC = () => {
  const [threadCount, setThreadCount] = useState(1);
  const [stage, nextStage] = useReducer((stage) => stage + 1, 0);

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
        value={threadCount}
        onChange={(e) => setThreadCount(e)}
      />
    </>
  );

  const processing = (
    <>
      <div className={styles.processing}>
        <div className={styles["processing-label"]}>
          <span>Discovering statistics</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>
    </>
  );

  const columns = <></>;

  return (
    <>
      <div className={styles.stats}>
        {stage === 0 && startProcessing}
        {stage === 1 && processing}
        {stage === 2 && columns}
      </div>
      <div className={styles.buttonsRow}>
        {stage < 2 && (
          <Button
            disabled={stage !== 0}
            onClick={() => {
              nextStage();
              setTimeout(nextStage, 2000);
            }}
          >
            Start Processing
          </Button>
        )}
      </div>
    </>
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
          <StatsTab />
        </Tab>
      </TabView>
    </div>
  );
};

export default FilePropsView;
