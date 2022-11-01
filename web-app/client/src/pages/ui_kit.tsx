import Button from '@components/Button';
import { Text, Checkbox, Select } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import styles from '@styles/UiKit.module.scss';

const tooltipContent = (
  <div className={styles.tooltipChildren}>
    <p>Title</p>
    <small>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</small>
  </div>
);

const Buttons = () => {
  const buttonContent = 'Click Me';
  const buttonVariants = [
    'gradient',
    'primary',
    'secondary',
    'tertiary',
  ] as const;

  return (
    <>
      {buttonVariants.map((variant) => (
        <div className={styles.row} key={variant}>
          <Button variant={variant} size="sm">
            {buttonContent}
          </Button>
          <Button variant={variant}>{buttonContent}</Button>
          <Button variant={variant} size="lg">
            {buttonContent}
          </Button>
          <Button variant={variant} disabled>
            {buttonContent}
          </Button>
        </div>
      ))}
    </>
  );
};

const InputText = () => {
  return (
    <div className={styles.row}>
      <Text label="Label" placeholder="Type something" />
      <Text
        label="Label"
        placeholder="Type something"
        tooltip={tooltipContent}
      />
      <Text label="Label" error="Error message" placeholder="Type something" />
      <Text label="Label" placeholder="Type something" disabled />
    </div>
  );
};

const InputCheckbox = () => {
  return (
    <div className={styles.row}>
      <Checkbox type="checkbox" label="Label" />
      <Checkbox type="checkbox" label="Label" error="Error message" />
      <Checkbox type="checkbox" label="Label" disabled />
    </div>
  );
};

const Tooltips = () => {
  return (
    <div className={styles.row}>
      <Tooltip>{tooltipContent}</Tooltip>
      <Tooltip position="right">{tooltipContent}</Tooltip>
      <Tooltip position="bottom">{tooltipContent}</Tooltip>
      <Tooltip position="left">{tooltipContent}</Tooltip>
    </div>
  );
};

const Selects = () => {
  const options = [
    {
      label: 'Comma (" , ")',
      value: ',',
    },
    {
      label: 'New line (" \\n ")',
      value: '\\n',
    },
    {
      label: 'Tabulation (" \\t ")',
      value: '\\t',
    },
  ];

  return (
    <div className={styles.row}>
      <Select label="Label" placeholder="Select" options={options} />
      <Select
        label="Label"
        placeholder="Select"
        options={options}
        isSearchable={false}
      />
      <Select
        label="Label"
        placeholder="Select"
        options={options}
        tooltip={tooltipContent}
      />
      <Select
        label="Label"
        placeholder="Select"
        options={options}
        error="Error message"
      />
      <Select label="Label" placeholder="Select" options={options} isDisabled />
    </div>
  );
};

const UIKit = () => {
  return (
    <div className={styles.root}>
      <Buttons />
      <InputText />
      <InputCheckbox />
      <Tooltips />
      <Selects />
    </div>
  );
};

export default UIKit;
