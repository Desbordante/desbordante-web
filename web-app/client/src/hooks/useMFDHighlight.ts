// hooks
import { useLazyQuery } from '@apollo/client';
// queries
import { MFDHighlight } from '@atoms/MFDTaskAtom';
import {
  GetMFDHighlightData,
  GetMFDHighlightDataVariables,
} from '@graphql/operations/queries/__generated__/GetMFDHighlightData';
import { GET_MFD_HIGHLIGHT_DATA } from '@graphql/operations/queries/getMFDHighlightData';
// error message
import { showError } from '@utils/toasts';

const useMFDHighlight = () => {
  const [loadMFDHighlight, { loading, error, data }] = useLazyQuery<
    GetMFDHighlightData,
    GetMFDHighlightDataVariables
  >(GET_MFD_HIGHLIGHT_DATA, {
    onError: (error) => {
      showError(error.message, "Can't fetch task data. Please try later.");
    },
  });

  return [loadMFDHighlight, { loading, error, data }] as const;
};

export default useMFDHighlight;
