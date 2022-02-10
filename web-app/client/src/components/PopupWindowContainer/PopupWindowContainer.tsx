import React from "react";
import { Container } from "react-bootstrap";
import { useSpring, animated } from "react-spring";
import OutsideClickHandler from "react-outside-click-handler";

import "./PopupWindowContainer.scss";

interface Props {
  onOutsideClick: () => void;
}

const PopupWindowContainer: React.FC<Props> = ({
  children,
  onOutsideClick,
}) => {
  const containerProps = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: {
      tension: 300,
    },
  });

  const AnimatedContainer = animated(Container);

  return (
    <AnimatedContainer
      fluid
      className="popup-bg bg-black bg-opacity-50 position-absolute h-100 flex-grow-1 d-flex align-items-center justify-content-center p-3"
      style={containerProps}
    >
      <OutsideClickHandler onOutsideClick={onOutsideClick}>
        {children}
      </OutsideClickHandler>
    </AnimatedContainer>
  );
};

export default PopupWindowContainer;
