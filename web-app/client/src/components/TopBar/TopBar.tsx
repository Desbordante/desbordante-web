import React, {useContext} from "react";
import {Container, Navbar} from "react-bootstrap";
import {useHistory, useLocation} from "react-router-dom";

import Button from "../Button/Button";
import {AuthContext} from "../AuthContext";

import styles from "./TopBar.module.scss"

const TopBar = () => {
  const history = useHistory();
  const location = useLocation();
  const {user, setIsSignUpShown, setIsLogInShown, signOut} =
    useContext(AuthContext)!;

  const isHomeScreen = location.pathname === "/";

  return (
    <Navbar variant="light" bg="transparent" style={{zIndex: 1}} className="d-block pb-0">
      <Container fluid className="mb-2">
        <Navbar.Brand
          className={styles.brand}
          onClick={() => {
            history.push("/");
          }}
        >
          <img
            src="/icons/logo.svg"
            alt="logo"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />{" "}
          Desbordante
        </Navbar.Brand>
        <Container fluid className="d-flex text-muted ps-0">
        </Container>
        {user?.name ? (
          <>
            <p className="mb-0 mx-2 text-light text-nowrap">
              Logged in as <span className="fw-bold">{user.name}</span>
            </p>
            {!user.isVerified && (
              <Button onClick={() => setIsSignUpShown(true)} className="mx-2">
                Verify Email
              </Button>
            )}
            <Button variant="secondary" onClick={signOut} className="mx-2">
              Sign Out
            </Button>
          </>
        ) : (
          <div className={styles.nav_buttons}>
            <Button
              variant="tetriaty"
              onClick={() => setIsLogInShown(true)}
              className="mx-2"
              sizeStyle="sm"
            >
              Log In
            </Button>
            <Button sizeStyle="sm" onClick={() => setIsSignUpShown(true)} variant="gradient"> 
              Sign Up
            </Button>
          </div>
        )}
      </Container>
    </Navbar>
  );
};

export default TopBar;
