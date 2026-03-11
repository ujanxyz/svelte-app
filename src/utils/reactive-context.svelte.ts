import { getContext, setContext } from "svelte";

export type ServiceMap = Record<string | symbol, any>;

export type ReactiveRegistry<T extends ServiceMap> = {
  services: T;
  register<K extends keyof T>(key: K, service: T[K]): void;
};

function createReactiveRegistry<T extends ServiceMap>(): ReactiveRegistry<T> {
  const services = {} as T;

  function register<K extends keyof T>(key: K, service: T[K]) {
    services[key] = service;
  }

  return { services, register };
}

export function createReactiveContext<T extends ServiceMap>(
  contextKey: symbol,
) {
  let providedOnce = false;

  return {
    provide() {
      if (providedOnce) {
        throw new Error(
          "Already 'provide'-ed once, key:" + contextKey.toString(),
        );
      }

      const registry = createReactiveRegistry<T>();
      setContext(contextKey, registry);
      providedOnce = true;
      return registry;
    },

    registerService<K extends keyof T>(key: K, service: T[K]) {
      const registry = getContext<ReactiveRegistry<T>>(contextKey);
      registry.register(key, service);
    },

    getServices(): T {
      const registry = getContext<ReactiveRegistry<T>>(contextKey);
      return registry.services;
    },
  };
}
