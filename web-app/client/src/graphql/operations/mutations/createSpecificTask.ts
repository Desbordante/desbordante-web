import { gql } from '@apollo/client';

export const CREATE_SPECIFIC_TASK = gql`
  mutation createSpecificTask($props: IntersectionSpecificTaskProps!) {
    createSpecificTask(props: $props) {
      taskID
    }
  }
`;
