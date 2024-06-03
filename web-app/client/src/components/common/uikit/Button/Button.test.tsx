import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

const user = userEvent.setup();

describe('Button Component', () => {
  const iconPathMock = '/icon.svg';
  const onClickMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render with text and icon', () => {
    render(<Button icon={iconPathMock}>Click me</Button>);
    expect(
      screen.getByRole('button', { name: /click me/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('Should be able to click', async () => {
    render(<Button onClick={onClickMock}>Click me</Button>);
    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(onClickMock).toBeCalledTimes(1);
  });
});
