import variables from '@styles/common/variables.module.scss';

const colors = {
  primary: {
    100: variables.primary100,
    75: variables.primary75,
    50: variables.primary50,
    25: variables.primary25,
    10: variables.primary10,
    5: variables.primary05,
  },
  black: {
    100: variables.black100,
    75: variables.black75,
    50: variables.black50,
    25: variables.black25,
    10: variables.black10,
    5: variables.black05,
  },
  white: {
    100: variables.white100,
    75: variables.white75,
    50: variables.white50,
    25: variables.white25,
    10: variables.white10,
    5: variables.white05,
  },
  success: {
    100: variables.success100,
    75: variables.success75,
    50: variables.success50,
    25: variables.success25,
    10: variables.success10,
    5: variables.success05,
  },
  error: {
    100: variables.error100,
    75: variables.error75,
    50: variables.error50,
    25: variables.error25,
    10: variables.error10,
    5: variables.error05,
  },
  info: {
    100: variables.info100,
    75: variables.info75,
    50: variables.info50,
    25: variables.info25,
    10: variables.info10,
    5: variables.info05,
  },
} as const;

export default colors;
