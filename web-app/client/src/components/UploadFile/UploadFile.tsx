import React, { useContext, useRef } from "react";

import "./UploadFile.scss";
import Button from "../Button/Button";
import FileLabel from "../FileLabel/FileLabel";
import { AlgorithmConfigContext } from "../AlgorithmConfigContext";
import { TaskContext } from "../TaskContext/TaskContext";

/* eslint-disable no-unused-vars */
interface Props {
  openBuiltinDatasetSelector: () => void;
  builtinDataset?: string;
  disableBuiltinDataset: () => void;
}
/* eslint-enable no-unused-vars */

const UploadFile: React.FC<Props> = ({
  openBuiltinDatasetSelector,
  builtinDataset,
  disableBuiltinDataset,
}) => {
  // you can only use <input type="file" /> for choosing files,
  // so the reference is used to forward click action
  // to hidden input file
  const inputFile = useRef<HTMLInputElement>(null);
  const { setFile } = useContext(TaskContext)!;

  return (
    <>
      <FileLabel
        builtinDataset={builtinDataset}
        onClick={() => inputFile?.current?.click()}
        className="mx-2"
      />
      <input
        type="file"
        id="file"
        className="d-none"
        ref={inputFile}
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
          disableBuiltinDataset();
        }}
        multiple={false}
        accept=".csv, .CSV"
      />
      <Button
        onClick={() => inputFile?.current?.click()}
        variant="light"
        className="mx-2"
      >
        <i className="bi bi-file-earmark-arrow-up" />
      </Button>
      <Button
        onClick={openBuiltinDatasetSelector}
        variant="light"
        className="mx-2"
      >
        <i className="bi bi-box" />
      </Button>
    </>
  );
};

export default UploadFile;
