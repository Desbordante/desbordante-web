import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnCard } from '@components/FileStats/ColumnCard/ColumnCard';
import { completedFileStatsMock } from '@graphql/operations/queries/__mocks__/getFileStats';

const user = userEvent.setup();

describe('ColumnCard Component', () => {
  const column = completedFileStatsMock.datasetInfo.statsInfo.stats[0];

  it('Should change mode', async () => {
    render(<ColumnCard columnStats={column} />);

    expect(() => screen.getByRole('table')).toThrow();

    const modeButton = screen.getByLabelText('Change mode');
    user.click(modeButton);

    await waitFor(() => expect(screen.getAllByRole('table')).toHaveLength(2));
  });

  it('Should show details', async () => {
    const { container } = render(<ColumnCard columnStats={column} />);

    const collapse = container.getElementsByClassName(
      'ReactCollapse--collapse',
    )[0];

    expect(collapse.getAttribute('aria-hidden')).toBe('true');

    const showDetailsButton = screen.getByLabelText('Show details');
    user.click(showDetailsButton);

    await waitFor(() => {
      expect(collapse.getAttribute('aria-hidden')).toBe('false');
    });
  });
});
