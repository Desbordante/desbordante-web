import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestPassword } from './TestPassword';

const user = userEvent.setup();

describe('Variants for password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const typePassword = async (text: string) => {
    render(<TestPassword />);
    const errorMessage =
      'The password does not match the pattern (see tooltip)';
    const input = screen.getByPlaceholderText('admin1234');
    const trigger = screen.getByRole('submit');
    await user.type(input, text);
    await user.click(trigger);
    return screen.queryByText(errorMessage);
  };
  test('Should show error cause too shot password', async () => {
    const error = await typePassword('Aa23.0');
    expect(error).toBeTruthy();
  });

  test('Should show error cause password without digit', async () => {
    const error = await typePassword('Aaaaaa.a');
    expect(error).toBeTruthy();
  });

  test('Should show error cause password without special symbol', async () => {
    const error = await typePassword('Aaaa2312');
    expect(error).toBeTruthy();
  });

  test('Should show error cause password without uppercase letter', async () => {
    const error = await typePassword('aaaa23.0');
    expect(error).toBeTruthy();
  });

  test('Should show error cause password without lowercase letter', async () => {
    const error = await typePassword('AAAA23.0');
    expect(error).toBeTruthy();
  });

  test('Should not show error cause good password', async () => {
    const error = await typePassword('Aaaa23.0');
    expect(error).toBeNull();
  });
});
