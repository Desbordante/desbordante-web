import { cmsProxyURL } from '@constants/endpoints';

export const cmsUrlWrapper = (pathname: string) => `${cmsProxyURL}${pathname}`;
