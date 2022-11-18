import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { StatsTab } from '@components/FilePropsView/StatsTab';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import {
  completedFileIdMock,
  completedFileStatsMock,
  errorFileIdMock,
  inProgressFileIdMock,
  inProgressFileStatsMock,
  notFoundFileIdMock,
  notFoundFileStatsMock,
  notProcessedFileIdMock,
  notProcessedFileStatsMock,
} from '@graphql/operations/queries/__mocks__/getFileStats';
import { getFileStats } from '@graphql/operations/queries/__generated__/getFileStats';
import { startProcessingStats } from '@graphql/operations/mutations/__generated__/startProcessingStats';
import { START_PROCESSING_STATS } from '@graphql/operations/mutations/startProcessingStats';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

const user = userEvent.setup();

describe('StatsTab Component', () => {
  const threadsCount = 5;

  const routerPushMock = useRouter().push;

  const queryMocks: MockedResponse<getFileStats>[] = [
    {
      request: {
        query: GET_FILE_STATS,
        variables: {
          fileID: notProcessedFileIdMock,
        },
      },
      result: {
        data: notProcessedFileStatsMock,
      },
    },
    {
      request: {
        query: GET_FILE_STATS,
        variables: {
          fileID: inProgressFileIdMock,
        },
      },
      result: {
        data: inProgressFileStatsMock,
      },
    },
    {
      request: {
        query: GET_FILE_STATS,
        variables: {
          fileID: completedFileIdMock,
        },
      },
      result: {
        data: completedFileStatsMock,
      },
    },
    {
      request: {
        query: GET_FILE_STATS,
        variables: {
          fileID: notFoundFileIdMock,
        },
      },
      result: {
        errors: notFoundFileStatsMock,
      },
    },
    {
      request: {
        query: GET_FILE_STATS,
        variables: {
          fileID: errorFileIdMock,
        },
      },
      result: {
        data: null,
      },
    },
  ];

  const mutationMocks: MockedResponse<startProcessingStats>[] = [
    {
      request: {
        query: START_PROCESSING_STATS,
        variables: { fileID: notProcessedFileIdMock, threadsCount: 5 },
      },
      newData: jest.fn(() => ({
        data: {
          startProcessingStats: {
            __typename: 'DatasetInfo',
            fileID: notProcessedFileIdMock,
          },
        },
      })),
    },
  ];

  const Component = (props: { fileID: string }) => (
    <MockedProvider mocks={[...queryMocks, ...mutationMocks]}>
      <StatsTab {...props} />
    </MockedProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should display start processing stage', async () => {
    render(<Component fileID={notProcessedFileIdMock} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Alert
    const alert: HTMLDivElement = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();

    // Button
    const button: HTMLButtonElement = screen.getByRole('button', {
      name: /Start Processing/i,
    });
    expect(button).toBeInTheDocument();

    // Input
    expect(await screen.getByText('Thread count')).toBeInTheDocument();

    const input: HTMLInputElement = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: threadsCount } });
    expect(input).toHaveValue(threadsCount.toString());
    fireEvent.blur(input);

    // Start processing
    user.click(button);

    const startProcessingMutationMock = mutationMocks[0].newData;
    await waitFor(() => expect(startProcessingMutationMock).toHaveBeenCalled());
  });

  it('Should display in progress stage', async () => {
    render(<Component fileID={inProgressFileIdMock} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Progress bar
    const progressBar = await waitFor(() =>
      screen.getByLabelText('Discovering statistics')
    );

    expect(progressBar).toHaveValue(
      inProgressFileStatsMock.datasetInfo?.statsProgress
    );

    // Progress text
    expect(
      await screen.findByText(
        `${inProgressFileStatsMock.datasetInfo?.statsProgress}%`
      )
    ).toBeInTheDocument();

    // Button
    expect(await screen.findByRole('button')).toBeDisabled();
  });

  it('Should display completed stage', async () => {
    render(<Component fileID={completedFileIdMock} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Overview
    await waitFor(() => {
      expect(screen.getByText('Columns')).toBeInTheDocument();
    });
    const select = await screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Column card

    // Expand select
    fireEvent.keyDown(select, { key: 'ArrowDown' });

    // Choose Column #0 option
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    fireEvent.keyDown(select, { key: 'Enter' });

    expect(screen.getByTestId('column-card')).toBeInTheDocument();

    // Show more
    const button = await screen.findByText(/show more/i);
    expect(button).toBeInTheDocument();
    user.click(button);

    await waitFor(() => {
      expect(routerPushMock).toBeCalledWith(
        `/create-task/file-stats?fileID=${completedFileIdMock}`
      );
    });
  });

  it('Should display not found error stage', async () => {
    render(<Component fileID={notFoundFileIdMock} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Alert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      notFoundFileStatsMock[0].message
    );
  });

  it('Should display unknown error stage', async () => {
    render(<Component fileID={errorFileIdMock} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Alert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An unknown error has occurred'
    );
  });
});
