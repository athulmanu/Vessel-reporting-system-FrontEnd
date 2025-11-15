import { ReactElement } from 'react';

declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T;
    mockResolvedValue(value: any): this;
    mockRejectedValue(value: any): this;
    mockReturnValue(value: any): this;
    mockImplementation(fn: (...args: Y) => T): this;
  }
}

declare const describe: (...args: any[]) => void;
declare const it: (...args: any[]) => void;
declare const expect: any;
declare const jest: any;
declare const beforeEach: (...args: any[]) => void;
declare const afterEach: (...args: any[]) => void;
declare const beforeAll: (...args: any[]) => void;
declare const afterAll: (...args: any[]) => void;

declare module '@testing-library/react-native' {
  export function render(ui: ReactElement): any;
  export const fireEvent: {
    press(element: any): void;
    changeText(element: any, value: string): void;
  };
  export function waitFor(callback: () => void, options?: Record<string, unknown>): Promise<void>;
}

export {};


