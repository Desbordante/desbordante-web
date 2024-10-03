import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestModal } from './TestModal';

const user = userEvent.setup();

describe('Testing Modal Container as Test Modal window', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('Should open, close by button and click outside', async () => {
    render(<TestModal />);

    const triggerOpen = screen.getByText('Test Button');
    await user.click(triggerOpen);
    expect(screen.getByText('Test Modal'));

    const triggerClose = screen.getByRole('close');
    await user.click(triggerClose);
    expect(screen.queryByText('Test Modal')).toBeNull();

    await user.click(triggerOpen);
    await user.click(screen.getByText('Outside'));
    expect(screen.queryByText('Test Modal')).toBeNull();
  });


});
