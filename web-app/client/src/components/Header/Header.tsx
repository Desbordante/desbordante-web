/* eslint-disable react/jsx-one-expression-per-line */

import React from "react";
import Button from "../Button/Button";

import styles from "./Header.module.scss";

const Header: React.FC = () => (<div className={styles.header}>

    <img src="/images/plexus.png" className={styles.bg} />

    <div className={styles.header_text}>
      <h1 className={styles.name_main}>Desbordante</h1>
      <p className={styles.description}>
        Open-source data profiling tool
      </p>
      <div className={styles.links}>
        <Button onClick={() => 0} variant="dark">Get Started</Button>

        <a href="/" className={styles.external_link}>Github</a>
        <a href="/" className={styles.external_link}>User Guide</a>

      </div>
    </div>
    
  </div>
);

export default Header;
