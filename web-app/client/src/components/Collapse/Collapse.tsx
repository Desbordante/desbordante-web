import { BaseHTMLAttributes, FC, PropsWithChildren, ReactElement, useState } from "react"
import Image from "next/image";
import classNames from "classnames";
import arrowDown from '@assets/icons/arrow-down.svg';
import styles from './Collapse.module.scss'

interface Props extends PropsWithChildren {
    title: string,
    titleProps: BaseHTMLAttributes<HTMLHeadingElement>
}

export const Collapse: FC<Props> = ({title, titleProps, children}) => {
    const [isShown, setIsShown] = useState(true)
    return <>
        <div className={classNames(!isShown && styles.collapsed, styles.title)} onClick={() => setIsShown(isShown => !isShown)}><h5 {...titleProps}>{title} <Image height={20} src={arrowDown.src} width={20} /></h5></div>
        {isShown && <div>{children}</div>}
    </>
}