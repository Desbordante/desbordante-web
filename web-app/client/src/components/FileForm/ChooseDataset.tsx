import React, { useContext, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import Button from "../Button/Button";
import FileLabel from "../FileLabel/FileLabel";
import { AuthContext } from "../AuthContext";
import { AlgorithmConfigContext } from "../AlgorithmConfigContext";
import FormItem from "../FormItem/FormItem";
import BuiltinDatasetSelector from "../BuiltinDatasetSelector/BuiltinDatasetSelector";
import Toggle from "../Toggle/Toggle";
import { FileFormContext } from "../FileFormContext";

const ChooseDataset = () => {
  const { dataset, setDataset } = useContext(FileFormContext)!;

  const [isWindowShown, setIsWindowShown] = useState(false);

  // you can only use <input type="file" /> for choosing files,
  // so the reference is used to forward click action
  // to hidden input file
  const inputFile = useRef<HTMLInputElement>(null);
  const { user } = useContext(AuthContext)!;
  const { allowedValues } = useContext(AlgorithmConfigContext)!;

  return (
    <FormItem>
      {isWindowShown && (
        <BuiltinDatasetSelector disable={() => setIsWindowShown(false)}>
          {allowedValues.allowedBuiltinDatasets &&
            allowedValues.allowedBuiltinDatasets.map((builtinDataset) => (
              <Toggle
                toggleCondition={builtinDataset === dataset}
                onClick={() => setDataset(builtinDataset)}
                key={builtinDataset.ID}
                className="mx-2"
              >
                {builtinDataset.fileName}
              </Toggle>
            ))}
        </BuiltinDatasetSelector>
      )}
      <h5 className="text-white mb-0 mx-2">File:</h5>
      <FileLabel
        dataset={dataset}
        setDataset={setDataset}
        onClick={
          user?.canUploadFiles ? () => inputFile?.current?.click() : undefined
        }
        className="mx-2"
      />
      <input
        type="file"
        id="file"
        className="d-none"
        ref={inputFile}
        onChange={
          user?.canUploadFiles
            ? (e) => {
                if (e.target.files) {
                  setDataset(e.target.files[0]);
                }
              }
            : undefined
        }
        multiple={false}
        accept=".csv, .CSV"
      />
      <OverlayTrigger
        overlay={
          <Tooltip className={user?.canUploadFiles ? "d-none" : ""}>
            Sign up to upload files
          </Tooltip>
        }
      >
        <span className="d-inline-block mx-2">
          <Button
            onClick={() => inputFile?.current?.click()}
            enabled={!!user?.canUploadFiles}
            variant="light"
            style={{ pointerEvents: user?.canUploadFiles ? "auto" : "none" }}
          >
            <i className="bi bi-file-earmark-arrow-up" />
          </Button>
        </span>
      </OverlayTrigger>
      <Button
        onClick={() => setIsWindowShown(true)}
        variant="light"
        className="mx-2"
      >
        <i className="bi bi-box" />
      </Button>
    </FormItem>
  );
};

export default ChooseDataset;
