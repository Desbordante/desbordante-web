import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from './Tooltip';

const user = userEvent.setup();

describe('Text Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render with text', async () => {
    render(<Tooltip>Test Tooltip</Tooltip>);
    const trigger = screen.getByRole('img');
    const tooltip = screen.getByText(/test tooltip/i);
    expect(tooltip).toHaveClass('hidden');
    await user.hover(trigger);
    expect(tooltip).not.toHaveClass('hidden');
    await user.unhover(trigger);
    expect(tooltip).toHaveClass('hidden');
  });
});
