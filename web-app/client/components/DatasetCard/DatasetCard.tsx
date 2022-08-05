import classNames from "classnames";
import { BaseHTMLAttributes, FC, PropsWithChildren } from "react"
import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/en'
import { formatDistance, subMinutes } from 'date-fns'
import { AllowedDataset } from "types/algorithms"
import threeDots from '@assets/icons/three-dots.svg';
import styles from './DatasetCard.module.scss';
import Image from "next/image";


interface DatasetCardProps extends BaseCardProps {
    file: AllowedDataset | File,
}

interface BaseCardProps extends PropsWithChildren {
    isSelected?: boolean,
    className?: string,
    onClick?: () => void
}

const getFileDescription = (file: AllowedDataset | File) => {
    if(file instanceof File){
        const formatter = new Intl.NumberFormat('en', {unit: 'byte', style: 'unit', unitDisplay: 'narrow', notation: 'compact'})
        const fileSize = formatter.format(file.size)
        return [
            fileSize,
            "File is not uploaded yet"
        ]
    }else{
        const formatter = new Intl.NumberFormat('en', {notation: 'compact'})
        const rowsCount = formatter.format(file.rowsCount)
        const countOfColumns = formatter.format(file.countOfColumns || 0)
        const range = formatDistance(subMinutes(new Date(), 15), new Date(), { addSuffix: true })
        return [
            `${rowsCount} rows, ${countOfColumns} columns`,
            `Updated ${range}` 
        ]
    }
}

export const DatasetCard: FC<DatasetCardProps> = ({file, ...rest}) => {
    const descriptionList = getFileDescription(file)
    const fileName = file instanceof File ? file.name : file.fileName
    return (
    <BaseCard {...rest}>
        <div className={styles.card_title}><p>{fileName}</p><Image src={threeDots.src} width={20} height={20} /></div>
        <div className={styles.card_description}>
            <span>{descriptionList.join("\n")}</span>
        </div>
    </BaseCard>
    )
}

export const BaseCard: FC<BaseCardProps> = ({children, isSelected=false, ...rest}) => {
    return (<div className={classNames(styles.card, isSelected ? styles.selected : null)} {...rest}>{children}</div>)
}