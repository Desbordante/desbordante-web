import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { StatsTab } from '@components/FilePropertiesModal/tabs/StatsTab';
import { startProcessingStats } from '@graphql/operations/mutations/__generated__/startProcessingStats';
import { START_PROCESSING_STATS } from '@graphql/operations/mutations/startProcessingStats';
import {
  getFileStats,
  getFileStats_datasetInfo_statsInfo_state_TaskState as TaskState,
} from '@graphql/operations/queries/__generated__/getFileStats';
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
  notSupportedFileIdMock,
  notSupportedFileStatsMock,
  startErrorFileIdMock,
  startErrorFileStatsMock,
  statsErrorFileIdMock,
  statsErrorFileStatsMock,
} from '@graphql/operations/queries/__mocks__/getFileStats';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import { TaskErrorStatusType } from 'types/globalTypes';

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
          fileID: startErrorFileIdMock,
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
    {
      request: {
        query: GET_FILE_STATS,
        variables: {
          fileID: statsErrorFileIdMock,
        },
      },
      result: {
        data: statsErrorFileStatsMock,
      },
    },
    {
      request: {
        query: GET_FILE_STATS,
        variables: {
          fileID: notSupportedFileIdMock,
        },
      },
      result: {
        data: notSupportedFileStatsMock,
      },
    },
  ];

  const mutationMocks: MockedResponse<startProcessingStats>[] = [
    {
      request: {
        query: START_PROCESSING_STATS,
        variables: { fileID: notProcessedFileIdMock, threadsCount },
      },
      newData: jest.fn(() => ({
        data: {
          createMainTaskWithDatasetChoosing: {
            __typename: 'TaskState',
            taskID: 'test',
          },
        },
      })),
    },
    {
      request: {
        query: START_PROCESSING_STATS,
        variables: { fileID: startErrorFileIdMock, threadsCount },
      },
      result: {
        errors: startErrorFileStatsMock,
      },
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

  it.each`
    name       | fileId
    ${'stage'} | ${notProcessedFileIdMock}
    ${'error'} | ${startErrorFileIdMock}
  `('Should display start processing $name', async ({ fileId }) => {
    render(<Component fileID={fileId} />);

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

    await user.type(input, threadsCount.toString(), {
      initialSelectionStart: 0,
      initialSelectionEnd: 1,
    });

    expect(input).toHaveValue(threadsCount.toString());

    fireEvent.blur(input);

    // Start processing
    user.click(button);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    switch (fileId) {
      case notProcessedFileIdMock:
        const startProcessingMutationMock = mutationMocks[0].newData;
        await waitFor(() =>
          expect(startProcessingMutationMock).toHaveBeenCalled(),
        );
        break;
      case startErrorFileIdMock:
        // Alert
        expect(await screen.findByRole('alert')).toHaveTextContent(
          startErrorFileStatsMock[0].message,
        );
        break;
    }
  });

  it('Should display in progress stage', async () => {
    render(<Component fileID={inProgressFileIdMock} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Progress bar
    const progressBar = await waitFor(() =>
      screen.getByLabelText('Discovering statistics'),
    );

    const progress = (
      inProgressFileStatsMock.datasetInfo?.statsInfo.state as TaskState
    ).progress;

    expect(progressBar).toHaveValue(progress);

    // Progress text
    expect(await screen.findByText(`${progress}%`)).toBeInTheDocument();

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
        `/create-task/file-stats?fileID=${completedFileStatsMock.datasetInfo.fileID}`,
      );
    });
  });

  it.each`
    fileId                  | errorMessage
    ${notFoundFileIdMock}   | ${notFoundFileStatsMock[0].message}
    ${errorFileIdMock}      | ${'An unknown error has occurred'}
    ${statsErrorFileIdMock} | ${TaskErrorStatusType.INTERNAL_SERVER_ERROR}
  `("Should display '$errorMessage'", async ({ fileId, errorMessage }) => {
    render(<Component fileID={fileId} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Alert
    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('Should display not supported alert', async () => {
    render(<Component fileID={notSupportedFileIdMock} />);

    // Loading
    expect(await screen.findByText('Loading...')).toBeInTheDocument();

    // Alert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /not supported/i,
    );
  });
});
