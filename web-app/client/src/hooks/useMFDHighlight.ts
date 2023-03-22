import { useLazyQuery } from '@apollo/client';
import {
  GetMFDHighlightInfo,
  GetMFDHighlightInfoVariables,
} from '@graphql/operations/queries/__generated__/GetMFDHighlightInfo';
import { GET_MFD_HIGHLIGHT_INFO } from '@graphql/operations/queries/getMFDHighlightInfo';
import { showError } from '@utils/toasts';

const useMFDHighlight = () => {
  const [loadMFDHighlight, { loading, error, data }] = useLazyQuery<
    GetMFDHighlightInfo,
    GetMFDHighlightInfoVariables
  >(GET_MFD_HIGHLIGHT_INFO, {
    onError: (error) => {
      showError(error.message, "Can't fetch task data. Please try later.");
    },
  });

  return [loadMFDHighlight, { loading, error, data }] as const;
};

export default useMFDHighlight;
