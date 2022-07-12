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
    <p className="description position-relative text-center">
      Open-source data profiling tool
    </p>
    <div className="links position-relative d-flex justify-content-center flex-grow-1 mb-2">
      <a
        href="https://github.com/Mstrutov/Desbordante"
        rel="noreferrer"
        target="_blank"
        className="text-white me-4"
      >
        <img src="/icons/github-logo.png" alt="github-icon" className="me-2" />
        GitHub
      </a>
      <a
        href="https://mstrutov.github.io/Desbordante"
        rel="noreferrer"
        target="_blank"
        className="text-white"
      >
        <img src="/icons/info-icon.png" alt="info-icon" className="me-2" />
        Docs
      </a>
    </div>
  </Container>
);

export default Header;
