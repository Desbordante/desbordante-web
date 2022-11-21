import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { getTaskInfo } from '@graphql/operations/queries/__generated__/getTaskInfo';
import {
  completedTaskIdMock,
  completedTaskInfoMock,
  inProgressTaskIdMock,
  inProgressTaskInfoMock,
} from '@graphql/operations/queries/__mocks__/getTaskInfo';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import Loader from './Loader';

describe('Loader Component', () => {
  const responseMock: MockedResponse<getTaskInfo>[] = [
    {
      request: {
        query: GET_TASK_INFO,
        variables: {
          taskID: inProgressTaskIdMock,
        },
      },
      result: {
        data: inProgressTaskInfoMock,
      },
    },
    {
      request: {
        query: GET_TASK_INFO,
        variables: {
          taskID: completedTaskIdMock,
        },
      },
      result: {
        data: completedTaskInfoMock,
      },
    },
  ];
  const routerPushMock = useRouter().push;
  const Component = (props: { taskID: string }) => (
    <MockedProvider mocks={responseMock}>
      <Loader {...props} />
    </MockedProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should display animated loading icon', async () => {
    render(<Component taskID={inProgressTaskIdMock} />);
    await waitFor(() => {
      expect(screen.getByTestId('animated-icon')).toBeInTheDocument();
    });
  });

  it('Should redirect to reports/dependencies when task is completed', async () => {
    render(<Component taskID={completedTaskIdMock} />);
    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(routerPushMock).toBeCalledWith({
        pathname: 'reports/dependencies',
        query: { taskID: completedTaskIdMock },
      });
    });
  });
});
