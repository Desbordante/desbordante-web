import { FC, useState } from 'react';
import Button from '@components/Button';
import { Alert } from '@components/FileStats/Alert';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import { Stage } from './Stage';

type StartStageProps = {
  onStart: (threadsCount: number) => void;
};

export const StartStage: FC<StartStageProps> = ({
  onStart,
}: StartStageProps) => {
  const [threadsCount, setThreadsCount] = useState(1);

  return (
    <Stage
      buttons={
        <Button onClick={() => onStart(threadsCount)}>Start Processing</Button>
      }
    >
      <Alert>
        Statistics have not been processed yet.
        <br />
        Would you like to start processing?
      </Alert>
      <NumberSlider
        sliderProps={{ min: 1, max: 9, step: 1 }}
        label="Thread count"
        value={threadsCount}
        onChange={(value) => setThreadsCount(Math.round(value))}
      />
    </Stage>
  );
};
