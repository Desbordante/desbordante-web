import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';
import { countries } from 'countries-list';

const user = userEvent.setup();

describe('Testing select dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const countryNames = Object.entries(countries).map(([, country]) => country);

  test('Should open dropdown, select option, close by click outside', async () => {
    render(
      <>
        <Select
          label="Country"
          placeholder="Germany"
          options={countryNames.map(({ emoji, native, name }) => ({
            label: `${emoji} ${native}`,
            value: name,
          }))}
        />
        <div>Outside</div>
      </>,
    );
    const trigger = screen.getByText('Germany');
    await user.click(trigger);
    const andorra = () => screen.getByText('🇦🇩 Andorra');
    const anguilla = screen.getByText('🇦🇮 Anguilla');
    const anguillaQuery = () => screen.queryByText('🇦🇮 Anguilla');
    expect(andorra());
    expect(anguilla);

    await user.click(andorra());
    expect(andorra());
    expect(anguillaQuery()).toBeNull();

    await user.click(andorra());
    expect(anguillaQuery()).not.toBeNull();
    await user.click(screen.getByText('Outside'));
    expect(anguillaQuery()).toBeNull();
  });
});
