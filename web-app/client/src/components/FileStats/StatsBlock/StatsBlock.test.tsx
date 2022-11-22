import { render, screen } from '@testing-library/react';
import { StatsBlock } from '@components/FileStats/StatsBlock/StatsBlock';

describe('StatsBlock Component', () => {
  it('Should not display when all values are null', async () => {
    render(<StatsBlock stats={[{ name: 'test', value: null }]} />);

    expect(screen.queryByTestId('stats-block')).not.toBeInTheDocument();
  });
});
