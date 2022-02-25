import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { AuthContext } from "../AuthContext";

const StageThree = () => {
  const { user, setIsSignUpShown } = useContext(AuthContext)!;

  return (
    <>
      <h1 className="text-center fw-bold mb-4">
        Welcome,{" "}
        <span className="text-primary">{user?.name || "Kirill Stupakov"}</span>!
      </h1>
      <p className="mb-4">You may now use all standard features.</p>
      <Button
        variant="outline-primary"
        className="mt-2 w-100"
        onClick={() => setIsSignUpShown(false)}
      >
        Close
      </Button>
    </>
  );
};

export default StageThree;
