import React, { useRef } from "react";

import "./UploadFile.scss";
import Button from "../Button/Button";
import FileLabel from "../FileLabel/FileLabel";

/* eslint-disable no-unused-vars */
interface Props {
  file: File | null;
  onClick: (file: File) => void;
  fileExistenceValidator: (file: File | null) => boolean;
  fileSizeValidator: (file: File | null) => boolean;
  fileFormatValidator: (file: File | null) => boolean;
  openPopupWindow: () => void;
  builtinDataset: string | null;
  disableBuiltinDataset: () => void;
}
/* eslint-enable no-unused-vars */

const UploadFile: React.FC<Props> = ({
  file,
  onClick,
  fileExistenceValidator,
  fileSizeValidator,
  fileFormatValidator,
  openPopupWindow,
  builtinDataset,
  disableBuiltinDataset,
}) => {
  // you can only use <input type="file" /> for choosing files,
  // so the reference is used to forward click action
  // to hidden input file
  const inputFile = useRef<HTMLInputElement>(null);

  return (
    <>
      <FileLabel
        file={file}
        builtinDataset={builtinDataset}
        onClick={() => inputFile?.current?.click()}
        fileExistenceValidator={fileExistenceValidator}
        fileSizeValidator={fileSizeValidator}
        fileFormatValidator={fileFormatValidator}
        setFile={onClick}
        className="mx-2 flex-grow-1"
      />
      <input
        type="file"
        id="file"
        className="d-none"
        ref={inputFile}
        onChange={(e) => {
          if (e.target.files) {
            onClick(e.target.files[0]);
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
        <img src="/icons/upload.svg" alt="upload" className="upload-icon" />
      </Button>
      <Button onClick={openPopupWindow} variant="light" className="mx-2">
        <img src="/icons/choose.svg" alt="choose" className="upload-icon" />
      </Button>
    </>
  );
};

export default UploadFile;
