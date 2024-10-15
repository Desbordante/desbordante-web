import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';

const user = userEvent.setup();
const options = [
  { label: 'aaa', value: 1 },
  { label: 'bbb', value: 2 },
  { label: 'ccc', value: 3 },
];

const renderAndOpen = async () => {
  render(
    <>
      <Select label="Label" placeholder="Placeholder" options={options} />
      <div>Outside</div>
    </>,
  );
  const trigger = screen.getByText('Placeholder');
  await user.click(trigger);
};

describe('Select with Dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should open dropdown', async () => {
    await renderAndOpen();
    expect(screen.getByText('aaa'));
  });

  test('Should select option', async () => {
    await renderAndOpen();
    await user.click(screen.getByText('aaa'));
    expect(screen.queryByText('aaa')).toBeTruthy();
    expect(screen.queryByText('bbb')).toBeNull();
  });

  test('Should close by click outside', async () => {
    await renderAndOpen();
    const outside = screen.getByText('Outside');
    await user.click(outside);
    expect(screen.queryByText('aaa')).toBeNull();
  });
});
