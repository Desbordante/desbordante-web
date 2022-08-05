import Image from "next/image";
import { FC, RefObject, useRef, useState } from "react"
import classNames from "classnames";
import cardStyles from "@components/DatasetCard/DatasetCard.module.scss"
import styles from './DatasetUploader.module.scss'
import uploadIcon from '@assets/icons/upload.svg';
import dragIcon from '@assets/icons/drag.svg';


type Props = {
    onChange: (files?: FileList) => void,
    isDraggedOutside?: boolean
}

const DatasetUploader : FC<Props> = ({onChange, isDraggedOutside=false}) => {
    const inputFile = useRef<HTMLInputElement>(null);
    const [isDraggedInside, setIsDraggedInside] = useState(false)
    return (
    <div 
      className={classNames(cardStyles.card, styles.uploader, isDraggedOutside ? styles.dragged_outside : null, isDraggedInside ? styles.dragged_inside : null)} 
      tabIndex={0} 
      onClick={() => inputFile?.current?.click()} 
      onDragEnter={() => setIsDraggedInside(true)} 
      onDragOver={e=>e.preventDefault()} 
      onDragLeave={e => setIsDraggedInside(false)}
      onDrop={e => {onChange(e.dataTransfer.files); setIsDraggedInside(false)}}
    >
        <div className={styles.uploader_title}>
          {(!isDraggedOutside && !isDraggedInside) && <><Image src={uploadIcon} height={20} width={20} /><p>Upload a File</p></>}          
          {(isDraggedOutside || isDraggedInside) && <><Image src={dragIcon} height={20} width={20} /><p>Drop here</p></>}          
          </div>
        <input
          type="file"
          id="file"
          ref={inputFile}
          style={{display: "none"}}
          onChange={e => onChange(e.target.files || undefined)}
          multiple={false}
          accept=".csv, .CSV"
        />
      </div>    
    )
}

export default DatasetUploader