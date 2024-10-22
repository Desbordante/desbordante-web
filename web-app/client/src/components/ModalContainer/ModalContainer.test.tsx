import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestModal } from './TestModal';

const user = userEvent.setup();

describe('Modal Container as Test Modal window', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAndOpen = async () => {
    render(<TestModal />);
    const triggerOpen = screen.getByText('Test Button');
    await user.click(triggerOpen);
  };

  test('Should open', async () => {
    await renderAndOpen();
    expect(screen.getByText('Test Modal'));
  });

  test('Should close by button', async () => {
    await renderAndOpen();
    const triggerClose = screen.getByRole('close');
    await user.click(triggerClose);
    expect(screen.queryByText('Test Modal')).toBeNull();
  });

  test('Should close by click outside', async () => {
    await renderAndOpen();
    await user.click(screen.getByText('Outside'));
    expect(screen.queryByText('Test Modal')).toBeNull();
  });
});
