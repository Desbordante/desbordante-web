import Button from '@components/Button'
import styles from './NumberInputWithButton.module.scss'
import { FC, useState } from 'react';
import NumberInput, { NumberInputProps } from '@components/Inputs/NumberInput/NumberInput';

type Props = {
    numberProps: NumberInputProps;
    buttonText: string;
    label: string
}

const NumberInputWithButton: FC<Props> = ({numberProps, buttonText, label}) => {
    const [displayValue, setDisplayValue] = useState(numberProps.defaultNum)
    const handleButtonClick = () => {
        console.log(displayValue)
    }
    return (
        <div className={styles.inputContainer}>
          <NumberInput
            label={label}
            numberProps={numberProps}
            value={displayValue}
            onChange={(e) => setDisplayValue(e)}
          />
          <Button variant="secondary" onClick={handleButtonClick}>{buttonText}</Button>
        </div>
        
    )
}

export default NumberInputWithButton