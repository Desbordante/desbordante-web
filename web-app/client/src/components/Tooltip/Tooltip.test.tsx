import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from './Tooltip';

const user = userEvent.setup();

describe('Testing tooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should open with text by hover and close by unhover', async () => {
    render(<Tooltip>Test Tooltip</Tooltip>);
    const trigger = screen.getByRole('img');
    await user.hover(trigger);
    expect(screen.getByText(/test tooltip/i));

    await user.unhover(trigger);
    expect(screen.queryByText(/test tooltip/i)).toBeNull();
  });
});
