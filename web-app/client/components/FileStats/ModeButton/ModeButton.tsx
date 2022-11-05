import { ButtonHTMLAttributes, FC } from "react";
import styles from "./ModeButton.module.scss";
import classNames from "classnames";
import { StatsMode } from "@components/FileStats/StatsBlock";
import grid from "@assets/icons/grid.svg";
import list from "@assets/icons/list.svg";
import Button from "@components/Button";

type ModeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  mode: StatsMode;
};

export const ModeButton: FC<ModeButtonProps> = ({
  className,
  mode,
  ...props
}: ModeButtonProps) => (
  <Button
    variant="secondary"
    icon={mode === StatsMode.Blocks ? grid : list}
    className={classNames(className, styles.wrapper)}
    {...props}
  />
);
