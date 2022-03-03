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
          user?.permissions.canUploadFiles
            ? () => inputFile?.current?.click()
            : undefined
        }
        className="mx-2"
      />
      <input
        type="file"
        id="file"
        className="d-none"
        ref={inputFile}
        onChange={
          user?.permissions.canUploadFiles
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
          <Tooltip className={user?.permissions.canUploadFiles ? "d-none" : ""}>
            Sign up to upload files
          </Tooltip>
        }
      >
        <span className="d-inline-block">
          <Button
            onClick={() => inputFile?.current?.click()}
            enabled={!!user?.permissions.canUploadFiles}
            variant="light"
            className="mx-2"
            style={{
              pointerEvents: user?.permissions.canUploadFiles ? "auto" : "none",
            }}
          >
            <i className="bi bi-file-earmark-arrow-up" />
          </Button>
        </span>
      </OverlayTrigger>

      <OverlayTrigger
        overlay={
          <Tooltip
            className={user?.permissions.canUseBuiltinDatasets ? "d-none" : ""}
          >
            No permissions to pick dataset
          </Tooltip>
        }
      >
        <span className="d-inline-block">
          <Button
            onClick={() => setIsWindowShown(true)}
            variant="light"
            className="mx-2"
            style={{
              pointerEvents: user?.permissions.canUseBuiltinDatasets
                ? "auto"
                : "none",
            }}
          >
            <i className="bi bi-box" />
          </Button>
        </span>
      </OverlayTrigger>
    </FormItem>
  );
};

export default ChooseDataset;
