import React, { DragEvent, DragEventHandler, FC, PropsWithChildren, ReactElement, RefObject } from "react";
import styles from './WizardLayout.module.scss';
import bg from '@public/bg.svg';

interface Props extends PropsWithChildren {
    header: ReactElement,
    footer: ReactElement,
    onDragOver?: () => void,
    onDragLeave?: () => void,
    onDrop: (event: DragEvent<HTMLDivElement>) => void,
}

export const WizardLayout: FC<Props> = ({header, footer, children, onDragOver, onDragLeave, onDrop}) => {
    return (
        <div className={styles.page} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <div className={styles.background}>
            <img
                src={bg.src}
                className={styles.background_image}
                alt="background"
            />
            </div>
            <div className={styles.section_text}>
                {header}
            </div>
            <div className={styles.content}>
                {children}
            </div>
            <div className={styles.footer}>
                {footer}
            </div>
        </div>
    )
}