import { BaseHTMLAttributes, FC, PropsWithChildren, ReactElement, useState } from "react"
import arrowDown from '@assets/icons/arrow-down.svg';
import Image from "next/image";

interface Props extends PropsWithChildren {
    title: string,
    titleProps: BaseHTMLAttributes<HTMLHeadingElement>
}

export const Collapse: FC<Props> = ({title, titleProps, children}) => {
    const [isShown, setIsShown] = useState(true)!
    return <>
        <div onClick={() => setIsShown(!isShown)}><h5 {...titleProps}>{title} <Image height={20} style={{transform: isShown ? undefined : "rotate(180deg)"}} src={arrowDown.src} width={20} /></h5></div>
        <div style={{display: isShown ? "block" : "none"}}>{children}</div>
    </>
}