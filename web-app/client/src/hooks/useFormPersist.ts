import { useEffect, useRef } from 'react';
import {
  FieldValues,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

export type StorageToValues<TValues> = Partial<{
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  [field in keyof TValues]: (value: any) => TValues[field];
}>;

const useFormPersist = <TFields extends FieldValues>(
  name: string,
  params: {
    watch: UseFormWatch<TFields>;
    setValue: UseFormSetValue<TFields>;
    reset: UseFormReset<TFields>;
    transformValues?: StorageToValues<TFields>;
  },
) => {
  const initialRender = useRef(true);
  const values = params.watch();

  useEffect(() => {
    if (!initialRender.current) {
      return;
    }

    const entry = localStorage.getItem(name);
    if (!entry) {
      return;
    }

    const values = JSON.parse(entry);

    for (const key in params.transformValues) {
      if (key in values) {
        values[key] = params.transformValues?.[key]?.(values[key]);
      }
    }

    params.reset(values);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      return;
    }

    const json = JSON.stringify(values);

    localStorage.setItem(name, json);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [values]);

  useEffect(() => {
    initialRender.current = false;
  }, []);
};

export default useFormPersist;
