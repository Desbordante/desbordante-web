import Button from '@components/Button';
import Input from '@components/Input';
import Tooltip from '@components/Tooltip';
import styles from '@styles/UiKit.module.scss';

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
      <Input label="Label" placeholder="Type something" />
      <Input label="Label" placeholder="Type something" tooltip="Tooltip" />
      <Input label="Label" error="Error message" placeholder="Type something" />
      <Input label="Label" placeholder="Type something" disabled />
    </div>
  );
};

const InputCheckbox = () => {
  return (
    <div className={styles.row}>
      <Input type="checkbox" label="Label" />
      <Input type="checkbox" label="Label" error="Error message" />
      <Input type="checkbox" label="Label" disabled />
    </div>
  );
};

const Tooltips = () => {
  const children = (
    <div className={styles.tooltipChildren}>
      <p>Title</p>
      <small>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</small>
    </div>
  );

  return (
    <div className={styles.row}>
      <Tooltip>{children}</Tooltip>
      <Tooltip position="right">{children}</Tooltip>
      <Tooltip position="bottom">{children}</Tooltip>
      <Tooltip position="left">{children}</Tooltip>
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
    </div>
  );
};

export default UIKit;
