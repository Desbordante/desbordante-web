import Image from "next/image";
import { FC, useRef } from "react"
import { BaseCard } from "@components/DatasetCard/DatasetCard"
import styles from './DatasetUploader.module.scss'
import uploadIcon from '@assets/icons/upload.svg';


type Props = {
    onChange: (files?: FileList) => void
}

const DatasetUploader : FC<Props> = ({onChange}) => {
    const inputFile = useRef<HTMLInputElement>(null);
    return (
    <BaseCard onClick={() => inputFile?.current?.click()}>
        <div className={styles.uploader_title}><Image src={uploadIcon} height={20} width={20} /><p>Upload a File</p></div>
        <input
          type="file"
          id="file"
          ref={inputFile}
          style={{display: "none"}}
          onChange={e => onChange(e.target.files || undefined)}
          multiple={false}
          accept=".csv, .CSV"
        />
      </BaseCard>    
    )
}

export default DatasetUploader