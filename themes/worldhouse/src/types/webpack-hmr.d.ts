/**
 * Webpack Hot Module Replacement (HMR) type definitions
 */

interface HotModule {
  accept(dependencies: string | string[], callback?: (updatedModules: string[]) => void): void;
  accept(dependency: string, callback?: () => void): void;
  accept(callback?: (updatedModules: string[]) => void): void;
  decline(dependencies?: string | string[]): void;
  dispose(callback: (data: Record<string, unknown>) => void): void;
  addDisposeHandler(callback: (data: Record<string, unknown>) => void): void;
  removeDisposeHandler(callback: (data: Record<string, unknown>) => void): void;
  invalidate(): void;
  status(): "idle" | "check" | "prepare" | "ready" | "dispose" | "apply" | "abort" | "fail";
  addStatusHandler(callback: (status: string) => void): void;
  removeStatusHandler(callback: (status: string) => void): void;
  check(autoApply?: boolean): Promise<string[]>;
  apply(options?: { ignoreUnaccepted?: boolean }): Promise<string[]>;
}

declare global {
  var module: {
    hot?: HotModule;
  };
}

export {};

