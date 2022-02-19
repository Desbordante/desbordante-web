import React, { useContext } from "react";
import "./FileLabel.scss";
import { useDropzone } from "react-dropzone";
import { AlgorithmConfigContext } from "../AlgorithmConfigContext";
import { AuthContext } from "../AuthContext";

/* eslint-disable no-unused-vars */
interface Props {
  onClick?: () => void;
  builtinDataset?: string;
  className: string;
  file?: File;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

const FileLabel: React.FC<Props> = ({
  onClick,
  builtinDataset,
  className = "",
  file,
  setFile,
}) => {
  const { user } = useContext(AuthContext)!;
  const { validators } = useContext(AlgorithmConfigContext)!;
  const { getRootProps } = useDropzone({
    onDrop: user?.canUploadFiles
      ? (acceptedFiles) => setFile(acceptedFiles[0])
      : undefined,
  });

  let displayText = "";
  if (validators.fileExistenceValidator(file)) {
    displayText = file!.name;
    if (displayText.length > 40) {
      displayText = displayText.slice(0, 40);
    }

    if (!validators.fileFormatValidator(file)) {
      displayText = "This format is not supported";
    }

    if (!validators.fileSizeValidator(file)) {
      displayText = "This file is too large";
    }
  } else {
    displayText = "Upload your dataset or choose one of ours";
  }

  let isError =
    validators.fileExistenceValidator(file) &&
    (!validators.fileSizeValidator(file) ||
      !validators.fileFormatValidator(file));

  if (builtinDataset) {
    displayText = builtinDataset;
    isError = false;
  }

  return (
    <div
      className={`file-label rounded-pill px-3 py-2 border border-2 cursor-pointer ${
        isError ? "border-danger text-danger" : "border-lighter-dark text-grey"
      } ${className}`}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...getRootProps()}
      onClick={onClick}
    >
      {displayText}
    </div>
  );
};

export default FileLabel;
