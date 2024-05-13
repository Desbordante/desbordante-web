import { FCWithChildren } from 'types/react';

const Portals: FCWithChildren = ({ children }) => {
  return <div id="portals-container-node">{children}</div>;
};

export default Portals;
