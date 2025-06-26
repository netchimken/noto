"use client";
import { z } from 'zod';

export namespace Store {
  const DATA_KEY = 'noto-data';

  export const DataSchema = z.object({
    token: z.string().nullable(),
  });

  type Data = z.infer<typeof DataSchema>;

  const InitialData: Data = {
    token: null
  };

  export function set(data: Data) {
    if (!localStorage) return;

    localStorage.setItem(DATA_KEY, JSON.stringify(DataSchema.parse(data)));
  }

  export function get() {
    if (!localStorage) return InitialData;

    let data = localStorage.getItem(DATA_KEY);
    if (!data) {
      set(InitialData);
      data = JSON.stringify(localStorage.getItem(DATA_KEY));
    }

    return DataSchema.parse(JSON.parse(data));
  }

  export function update<T extends keyof Data>(property: T, value: Data[T]) {
    if (!localStorage) return;

    let data = get();
    data[property] = value;

    set(data);
  }
}