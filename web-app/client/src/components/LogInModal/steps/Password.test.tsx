import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestPassword } from './TestPassword';

const user = userEvent.setup();

describe('Testing variants for password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

const prepare = () => {
  render(<TestPassword />);
  const input = screen.getByPlaceholderText('admin1234');
  const trigger = screen.getByRole('submit');
  const errorQuery = () =>
    screen.queryByText('The password does not match the pattern (see tooltip)');
  return { input, trigger, errorQuery };
};

test('Too shot password', async () => {
  const { input, trigger, errorQuery } = prepare();
  fireEvent.change(input, { target: { value: 'Aa23.0' } });
  await user.click(trigger);
  expect(errorQuery()).not.toBeNull();
});

test('Password without digit', async () => {
  const { input, trigger, errorQuery } = prepare();
  fireEvent.change(input, { target: { value: 'Aaaaaa.a' } });
  await user.click(trigger);
  expect(errorQuery()).not.toBeNull();
});

test('Password without special symbol', async () => {
  const { input, trigger, errorQuery } = prepare();
  fireEvent.change(input, { target: { value: 'Aaaa2312' } });
  await user.click(trigger);
  expect(errorQuery()).not.toBeNull();
});

test('Password without uppercase letter', async () => {
  const { input, trigger, errorQuery } = prepare();
  fireEvent.change(input, { target: { value: 'aaaa23.0' } });
  await user.click(trigger);
  expect(errorQuery()).not.toBeNull();
});

test('Password without lowercase letter', async () => {
  const { input, trigger, errorQuery } = prepare();
  fireEvent.change(input, { target: { value: 'AAAA23.0' } });
  await user.click(trigger);
  expect(errorQuery()).not.toBeNull();
});

test('Good password', async () => {
  const { input, trigger, errorQuery } = prepare();
  fireEvent.change(input, { target: { value: 'Aaaa23.0' } });
  await user.click(trigger);
  expect(errorQuery()).toBeNull();
});
});

