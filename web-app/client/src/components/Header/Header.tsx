/* eslint-disable react/jsx-one-expression-per-line */

import React from "react";
import "./Header.scss";
import { Container } from "react-bootstrap";

const Header: React.FC = () => (
  <Container
    fluid
    className="position-relative w-100 py-3 py-xl-5 flex-column flex-shrink-0 justify-content-center align-items-center overflow-hidden video-header text-white"
  >
    <video autoPlay loop muted playsInline className="position-absolute">
      <source src="/videos/background-min-cropped.webm" type="video/webm" />
    </video>
    <Container className="name-and-logo position-relative d-flex justify-content-center align-items-center">
      <h1 className="name-main fs-0">Desbordante</h1>
    </Container>
    <h2 className="description position-relative text-center">
      <a
        href="https://github.com/Mstrutov/Desbordante"
        rel="noreferrer"
        target="_blank"
        className="text-white"
      >
        Open-source
      </a>{" "}
      data profiling tool
    </h2>
  </Container>
);

export default Header;
