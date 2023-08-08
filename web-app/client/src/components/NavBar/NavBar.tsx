import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useRef } from 'react';
import logo from '@public/logo.svg';
import styles from './NavBar.module.scss';

type Route = {
  label: string;
  path: string;
  redirectTo?: string;
};

const routes: Route[] = [
  {
    label: 'Discover',
    path: '/create-task/',
    redirectTo: '/create-task/choose-primitive',
  },
  {
    label: 'Papers',
    path: '/papers',
  },
  {
    label: 'Team',
    path: '/team',
  },
];

const NavBar: FC = () => {
  const widths = useRef([...new Array(routes.length)]);
  const router = useRouter();

  const selectedRouteIndex = routes.findIndex(({ path }) =>
    router.pathname.includes(path)
  );

  return (
    <nav className={styles.navBar}>
      <ul className={styles.itemsContainer}>
        <li>
          <Link href="/" className={styles.brand}>
            <Image
              src={logo}
              alt="Logo"
              className={styles.logo}
              width={39.5}
              height={40}
            />
            Desbordante
          </Link>
        </li>

        {routes.map(({ label, path, redirectTo }, index) => (
          <li
            key={path}
            className={cn(
              styles.underline,
              index === selectedRouteIndex && styles.selected
            )}
            ref={(node) => {
              widths.current[index] = node?.offsetWidth ?? 0;
            }}
            style={{ width: widths.current[index] }}
          >
            <Link href={redirectTo ?? path}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
