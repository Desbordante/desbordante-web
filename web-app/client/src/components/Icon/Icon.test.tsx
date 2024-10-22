import { render, screen } from '@testing-library/react';
import Icon from './Icon';

describe('Icon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render icon', async () => {
    render(<Icon name="info" />);
    expect(screen.getByRole('img'));
  });
});
