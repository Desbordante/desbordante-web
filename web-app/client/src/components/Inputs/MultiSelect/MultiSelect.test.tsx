import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelect from './MultiSelect';

const user = userEvent.setup();
const options = [
  { label: 'aaa', value: 1 },
  { label: 'bbb', value: 2 },
  { label: 'ccc', value: 3 },
];

const renderAndOpen = async () => {
  render(
    <>
      <MultiSelect label="Label" placeholder="Placeholder" options={options} />
      <div>Outside</div>
    </>,
  );
  const trigger = screen.getByText('Placeholder');
  await user.click(trigger);
};

describe('Multiselect with dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should open dropdown', async () => {
    await renderAndOpen();
    expect(screen.getByText('aaa'));
  });
  test('Should select first option', async () => {
    await renderAndOpen();
    await user.click(screen.getByText('aaa'));
    expect(screen.queryByText('aaa'));
    expect(screen.queryByText('bbb')).toBeNull();
  });
  test('Should select second option', async () => {
    await renderAndOpen();
    await user.click(screen.getByText('aaa'));
    await user.click(screen.getByText('aaa'));
    screen.getByText('bbb');
    await user.click(screen.getByText('bbb'));
    expect(screen.queryByText('aaa')).toBeTruthy();
    expect(screen.queryByText('bbb')).toBeTruthy();
  });
  test('Should close by click outside', async () => {
    await renderAndOpen();
    await user.click(screen.getByText('Outside'));
    expect(screen.queryByText('aaa')).toBeNull();
  });
});
