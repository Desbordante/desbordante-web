import { FC, PropsWithChildren, ReactElement, useState } from "react"

import arrowDown from '@assets/icons/arrow-down.svg';


interface Props extends PropsWithChildren {
    title: ReactElement
}

export const Collapse: FC<Props> = ({title, children}) => {
    const [isShown, setIsShown] = useState(true)!
    return <>
        <div onClick={() => setIsShown(!isShown)}><h5>{title} <img style={{transform: isShown ? undefined : "rotate(180deg)"}} src={arrowDown.src} width={20} /></h5></div>
        <div style={{display: isShown ? "block" : "none"}}>{children}</div>
    </>
}