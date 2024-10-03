import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelect from './MultiSelect';
import { countries } from 'countries-list';

const user = userEvent.setup();

describe('Testing multi select dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const countryNames = Object.entries(countries).map(
      ([, country]) => country,
    );

  test('Should open dropdown, select first and second option, close by click outside', async () => {
    render(
      <>
        <MultiSelect
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
    const anguilla = () => screen.getByText('🇦🇮 Anguilla');
    const antiguaQuery = () => screen.queryByText('🇦🇬 Antigua and Barbuda');
    const anguillaQuery = () => screen.queryByText('🇦🇮 Anguilla');
    expect(andorra() && anguilla());
    expect(antiguaQuery()).not.toBeNull();

    await user.click(andorra());
    expect(andorra());
    expect(anguillaQuery()).toBeNull();

    await user.click(andorra());
    await user.click(anguilla());
    expect(anguillaQuery()).not.toBeNull();
    expect(antiguaQuery()).toBeNull();

    await user.click(screen.getByText('Outside'));
    expect(antiguaQuery()).toBeNull();
  });
});
