import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { AuthContext } from "../AuthContext";

interface Props {
  onClose: () => void;
}

const FeedbackSuccess: React.FC<Props> = ({ onClose }) => {
  const { user } = useContext(AuthContext)!;

  return (
    <>
      <h1 className="text-center fw-bold mb-4">
        Thank you,{" "}
        <span className="text-primary">{user?.name || "Anonymous"}</span>
      </h1>
      <p className="mb-4">We received your feedback.</p>
      <Button
        variant="outline-primary"
        className="mt-2 w-100"
        onClick={onClose}
      >
        Close
      </Button>
    </>
  );
};

export default FeedbackSuccess;
