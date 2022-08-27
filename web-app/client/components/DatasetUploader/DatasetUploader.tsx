import Image from 'next/image';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { DefaultContext, useMutation } from '@apollo/client';
import {
  uploadDataset,
  uploadDatasetVariables,
} from '@graphql/operations/mutations/__generated__/uploadDataset';
import { UPLOAD_DATASET } from '@graphql/operations/mutations/uploadDataset';
import { AllowedDataset } from 'types/algorithms';
import { ErrorContext } from '@components/ErrorContext';
import ProgressBar, { Progress } from '@components/ProgressBar/ProgressBar';
import cardStyles from '@components/DatasetCard/DatasetCard.module.scss';
import styles from './DatasetUploader.module.scss';
import checkIcon from '@assets/icons/check.svg';
import crossIcon from '@assets/icons/cross.svg';
import uploadIcon from '@assets/icons/upload.svg';
import dragIcon from '@assets/icons/drag.svg';

type Props = {
  onUpload: (file: AllowedDataset) => void;
};

const DatasetUploader: FC<Props> = ({ onUpload }) => {
  const { showError } = useContext(ErrorContext)!;
  const inputFile = useRef<HTMLInputElement>(null);
  const [isFileDragged, setIsFileDragged] = useState(false);
  const [isDraggedInside, setIsDraggedInside] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState<Progress>({
    state: 'idle',
  });
  const [uploadDataset] = useMutation<uploadDataset, uploadDatasetVariables>(
    UPLOAD_DATASET
  );

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsFileDragged(false);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsFileDragged(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsFileDragged(false);
  }, []);

  useEffect(() => {
    window.document.addEventListener('drop', onDrop);
    window.document.addEventListener('dragover', onDragOver);
    window.document.addEventListener('dragleave', onDragLeave);
    return () => {
      window.document.removeEventListener('drop', onDrop);
      window.document.removeEventListener('dragover', onDragOver);
      window.document.removeEventListener('dragleave', onDragLeave);
    };
  }, []);

  useEffect(() => {
    if (
      fileUploadProgress.state === 'fail' ||
      fileUploadProgress.state === 'complete'
    ) {
      setTimeout(() => setFileUploadProgress({ state: 'idle' }), 800);
    }
  }, [fileUploadProgress]);

  const context: DefaultContext = {
    fetchOptions: {
      useUpload: true,
      onProgress: (ev: ProgressEvent) => {
        setFileUploadProgress({
          state: 'process',
          amount: ev.loaded / ev.total,
        });
      },
    },
  };

  const onChange = (files: FileList | null) => {
    setIsDraggedInside(false);
    if (files?.length) {
      uploadDataset({
        variables: {
          datasetProps: { delimiter: ',', hasHeader: false },
          table: files[0],
        },
        context,
      })
        .then((res) => {
          console.log(res);
          onUpload(res.data?.uploadDataset as AllowedDataset);
          setFileUploadProgress({ state: 'complete' });
        })
        .catch((error) => {
          showError({ message: error.message });
          setFileUploadProgress({ state: 'fail' });
        });
    }
  };

  return (
    <div
      className={classNames(
        cardStyles.card,
        styles.uploader,
        isFileDragged ? styles.dragged_outside : null,
        isDraggedInside ? styles.dragged_inside : null
      )}
      tabIndex={0}
      onClick={(e) => inputFile?.current?.click()}
      onDragEnter={(e) => setIsDraggedInside(true)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggedInside(true);
      }}
      onDragLeave={(e) => setIsDraggedInside(false)}
      onDrop={(e) => onChange(e.dataTransfer.files)}
    >
      <div className={styles.uploader_title}>
        {fileUploadProgress.state === 'idle' &&
          !isFileDragged &&
          !isDraggedInside && (
            <>
              <Image src={uploadIcon} height={20} width={20} />
              <p>Upload a File</p>
            </>
          )}
        {(isFileDragged || isDraggedInside) && (
          <>
            <Image src={dragIcon} height={20} width={20} />
            <p>Drop here</p>
          </>
        )}
        {fileUploadProgress.state === 'process' && (
          <>
            <Image src={uploadIcon} height={20} width={20} />
            <p>Uploading...</p>
          </>
        )}
        {fileUploadProgress.state === 'complete' && (
          <>
            <Image src={checkIcon} height={20} width={20} />
            <p>Complete</p>
          </>
        )}
        {fileUploadProgress.state === 'fail' && (
          <>
            <Image src={crossIcon} height={20} width={20} />
            <p>Error</p>
          </>
        )}
      </div>
      {fileUploadProgress.state !== 'idle' && (
        <ProgressBar progress={fileUploadProgress} />
      )}

      <input
        type="file"
        id="file"
        ref={inputFile}
        style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files)}
        multiple={false}
        accept=".csv, .CSV"
      />
    </div>
  );
};

export default DatasetUploader;
