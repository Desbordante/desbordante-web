import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from './Tooltip';

const user = userEvent.setup();

describe('Tooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAndOpen = async () => {
    render(<Tooltip>Test Tooltip</Tooltip>);
    const trigger = screen.getByRole('img');
    await user.hover(trigger);
    return trigger;
  };

  test('Should open with text by hover', async () => {
    await renderAndOpen();
    expect(screen.getByText(/test tooltip/i));
  });

  test('Should close by unhover', async () => {
    const trigger = await renderAndOpen();
    await user.unhover(trigger);
    expect(screen.queryByText(/test tooltip/i)).toBeNull();
  });
});
