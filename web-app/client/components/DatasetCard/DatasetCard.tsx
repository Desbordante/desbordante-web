import classNames from "classnames";
import { BaseHTMLAttributes, FC } from "react"
import { limitString } from "@utils/strings"
import { AllowedDataset } from "types/algorithms"
import threeDots from '@assets/icons/three-dots.svg';
import styles from './DatasetCard.module.scss';
import Image from "next/image";

interface DatasetCardProps extends BaseCardProps {
    file: AllowedDataset | File,
}

interface BaseCardProps extends BaseHTMLAttributes<HTMLDivElement> {
    isSelected?: boolean
}

const getFileDescription = (file: AllowedDataset | File) => {
    if(file instanceof File){
        return [
            file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(2)} KB`,
            "File is not uploaded yet"
        ]
    }else{
        return [
            `${file.rowsCount} rows, ${file.countOfColumns} columns`,
            "Updated 15 minutes ago"
        ]
    }
}

export const DatasetCard: FC<DatasetCardProps> = ({file, ...rest}) => {
    const descriptionList = getFileDescription(file)
    const fileName = file instanceof File ? file.name : file.fileName
    return (
    <BaseCard {...rest}>
        <div className={styles.card_title}><p>{limitString(fileName, 14)}</p><Image src={threeDots.src} width={20} height={20} /></div>
        <div className={styles.card_description}>
            <span>{descriptionList.join("\n")}</span>
        </div>
    </BaseCard>
    )
}

export const BaseCard: FC<BaseCardProps> = ({children, isSelected=false, ...rest}) => {
    return (<div className={classNames(styles.card, isSelected ? styles.selected : null)} {...rest}>{children}</div>)
}