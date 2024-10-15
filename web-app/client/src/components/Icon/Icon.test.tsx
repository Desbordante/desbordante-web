import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Icon from './Icon';

const user = userEvent.setup();

describe('Icon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render icon', async () => {
    render(<Icon name="info" />);
    expect(screen.getByRole('img'));
  });
});
