import React, { useContext, useRef } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import Button from "../Button/Button";
import FileLabel from "../FileLabel/FileLabel";
import { AuthContext } from "../AuthContext";

/* eslint-disable no-unused-vars */
interface Props {
  openBuiltinDatasetSelector: () => void;
  builtinDataset?: string;
  disableBuiltinDataset: () => void;
  file?: File;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}
/* eslint-enable no-unused-vars */

const UploadFile: React.FC<Props> = ({
  openBuiltinDatasetSelector,
  builtinDataset,
  disableBuiltinDataset,
  file,
  setFile,
}) => {
  // you can only use <input type="file" /> for choosing files,
  // so the reference is used to forward click action
  // to hidden input file
  const inputFile = useRef<HTMLInputElement>(null);
  const { user } = useContext(AuthContext)!;

  return (
    <>
      <FileLabel
        file={file}
        setFile={setFile}
        builtinDataset={builtinDataset}
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
                  setFile(e.target.files[0]);
                }
                disableBuiltinDataset();
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
