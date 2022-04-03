import React, { ReactElement } from "react";
import StatusDisplay from "../StatusDisplay/StatusDisplay";

interface Props {
  isLoading: boolean;
  children: ReactElement<any, any>;
}

const LoadingContainer: React.FC<Props> = ({ isLoading, children }) =>
  isLoading ? <StatusDisplay text="Loading" /> : children;

export default LoadingContainer;
