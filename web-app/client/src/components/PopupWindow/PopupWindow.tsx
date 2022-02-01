import React from "react";

import "./PopupWindow.scss";

interface Props {
  children: React.ReactNode;
  disable: () => void;
}

const PopupWindow: React.FC<Props> = ({ children, disable }) => (
  <div
    className="popup-window-bg position-absolute w-100 h-100 flex-grow-1 bg-black bg-opacity-50 d-flex justify-content-center align-items-center"
    onClick={disable}
  >
    <div
      className="px-5 py-4 bg-dark rounded-pill shadow-lg"
      onClick={() => {}}
    >
      {children}
    </div>
  </div>
);

export default PopupWindow;
