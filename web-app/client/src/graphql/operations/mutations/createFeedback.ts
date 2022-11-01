import { gql } from "@apollo/client";

export const CREATE_FEEDBACK = gql`
  mutation createFeedback($rating: Int!, $subject: String, $text: String!) {
    createFeedback(rating: $rating, subject: $subject, text: $text) {
      feedbackID
    }
  }
`;
