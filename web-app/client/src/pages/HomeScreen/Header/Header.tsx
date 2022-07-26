/* eslint-disable react/jsx-one-expression-per-line */

import React from "react";
import Button from "../../../components/Button/Button";

import styles from "./Header.module.scss";

const Header: React.FC = () => (<div className={styles.header}>

    <div className={styles.background} >
          <img src="/images/plexus.svg" className={styles.background_image} />
    </div>

    <div className={styles.header_text}>
      <h1 className={styles.name_main}>Desbordante</h1>
      <p className={styles.description}>
        Open-source data profiling tool
      </p>
      <div className={styles.links}>
        <Button onClick={() => window.scroll(0, 700)} variant="dark">Get Started</Button>

        <a href="https://github.com/Mstrutov/Desbordante" className={styles.external_link}>Github</a>
        <a href="https://mstrutov.github.io/Desbordante" className={styles.external_link}>User Guide</a>

      </div>
    </div>
    
  </div>
);

export default Header;
