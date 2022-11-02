import { render, screen } from '@testing-library/react';
import Text from './Text';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

describe('Text Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render with label', () => {
    render(<Text label="Test Label" />);
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
  });

  it('Should be able to type', async () => {
    render(<Text label="Test Label" />);
    const input = screen.getByLabelText(/test label/i);
    await user.type(input, 'Some text');
    await user.click(document.body);
    expect(input).toHaveValue('Some text');
  });

  it('Should be able to see tooltip', async () => {
    render(<Text label="Test Label" tooltip="tooltip" />);
    await user.hover(screen.getByRole('img'));
    expect(screen.getByText(/tooltip/i)).toBeInTheDocument();
  });

  it('Should be able to see error', async () => {
    render(<Text label="Test Label" error="Error text" />);
    expect(screen.getByText(/error text/i)).toBeInTheDocument();
  });

  it('Should be able to set disabled', async () => {
    render(<Text label="Test Label" disabled />);
    expect(screen.getByLabelText(/test label/i)).toBeDisabled();
  });
});
