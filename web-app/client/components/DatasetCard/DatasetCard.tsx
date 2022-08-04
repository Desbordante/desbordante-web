import classNames from "classnames";
import { BaseHTMLAttributes, FC } from "react"
import { limitString } from "@utils/strings"
import { AllowedDataset } from "types/algorithms"
import threeDots from '@assets/icons/three-dots.svg';
import styles from './DatasetCard.module.scss';

interface DatasetCardProps extends BaseCardProps {
    file: AllowedDataset,
}

interface FileCardProps extends BaseCardProps {
    file: File,
}
interface BaseCardProps extends BaseHTMLAttributes<HTMLDivElement> {
    isSelected?: boolean
}

export const DatasetCard: FC<DatasetCardProps> = ({file, ...rest}) => {
    const fileDescription = `${file.rowsCount} rows, ${file.countOfColumns} columns`
    return (
    <BaseCard {...rest}>
        <div className={styles.card_title}><p>{limitString(file.fileName, 14)}</p><img src={threeDots.src} width={20} /></div>
        <div className={styles.card_description}>
          <span className={fileDescription.length > 27 ? styles.large_content : undefined}>{fileDescription}</span>
          <span>Uploaded 15 minutes ago</span>
        </div>
    </BaseCard>
    )
}

export const FileCard: FC<FileCardProps> = ({file, ...rest}) => {
    return (
    <BaseCard {...rest}>
        <div className={styles.card_title}><p>{limitString(file.name, 14)}</p><img src={threeDots.src} width={20} /></div>
        <div className={styles.card_description}>
          <span>{file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(2)} KB`}</span>
          <span>File is not uploaded yet</span>
        </div>
    </BaseCard>
    )
}

export const BaseCard: FC<BaseCardProps> = ({children, isSelected=false, ...rest}) => {
    return (<div className={classNames(styles.card, isSelected ? styles.selected : null)} {...rest}>{children}</div>)
}