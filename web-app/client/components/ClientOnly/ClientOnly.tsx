import { FC, PropsWithChildren, useEffect, useState } from 'react';

const ClientOnly: FC<PropsWithChildren> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return null;
  } else {
    return <>{children}</>;
  }
};

export default ClientOnly;
