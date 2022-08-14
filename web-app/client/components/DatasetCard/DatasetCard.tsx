import classNames from "classnames";
import { FC, PropsWithChildren, useState } from "react"
import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/en'
import { formatDistance, subMinutes } from 'date-fns'
import { AllowedDataset } from "types/algorithms"
import threeDots from '@assets/icons/three-dots.svg';
import styles from './DatasetCard.module.scss';
import Image from "next/image";
import FilePropsView from "@components/FilePropsView/FilePropsView";
import PopupWindowContainer from "@components/PopupWindowContainer/PopupWindowContainer";


interface DatasetCardProps extends BaseCardProps {
    file: AllowedDataset,
}

interface BaseCardProps extends PropsWithChildren {
    isSelected?: boolean,
    className?: string,
    onClick?: () => void
}

const getFileDescription = (file: AllowedDataset) => {
    const formatter = new Intl.NumberFormat('en', {notation: 'compact'})
    const rowsCount = formatter.format(file.rowsCount)
    const countOfColumns = formatter.format(file.countOfColumns || 0)
    const range = formatDistance(subMinutes(new Date(), 15), new Date(), { addSuffix: true })
    return [
        `${rowsCount} rows, ${countOfColumns} columns`,
        `Updated ${range}` 
    ]
}

export const DatasetCard: FC<DatasetCardProps> = ({file, ...rest}) => {
    const descriptionList = getFileDescription(file)
    const fileName = file.fileName
    const [filePropsShown, setFilePropsShown ] = useState(false)

    return (
    <>
        {filePropsShown && <PopupWindowContainer onOutsideClick={() => setFilePropsShown(false)}>
            <FilePropsView data={file} />
        </PopupWindowContainer>}
        <BaseCard {...rest}>
            <div className={styles.card_title}><p>{fileName}</p><Image onClick={() => setFilePropsShown(true)} src={threeDots.src} width={20} height={20} /></div>
            <div className={styles.card_description}>
                <span>{descriptionList.join("\n")}</span>
            </div>
        </BaseCard>
    </>
    )
}

const BaseCard: FC<BaseCardProps> = ({children, isSelected=false, ...rest}) => {
    return (<div className={classNames(styles.card, isSelected ? styles.selected : null)} {...rest}>{children}</div>)
}