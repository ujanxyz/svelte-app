import { getContext, setContext } from "svelte";

type ServiceMap = Record<string, any>;
type UnregisterService = () => void;

interface ReactiveRegistry<T extends ServiceMap> {
  services: T;
  register<K extends keyof T>(key: K, service: T[K]): void;
  unregister<K extends keyof T>(key: K): void;
}

function createReactiveRegistry<T extends ServiceMap>(): ReactiveRegistry<T> {
  const services = {} as T;

  function register<K extends keyof T>(key: K, service: T[K]) {
    services[key] = service;
  }

  // TODO: Remove this unregister mechanism, it's not used and not possible to use.
  function unregister<K extends keyof T>(key: K): void {
    delete services[key];
  }

  return { services, register, unregister };
}

export function createReactiveContext<T extends ServiceMap>(
  contextKey: symbol,
) {
  return {
    provide(): void {
      const registry = createReactiveRegistry<T>();
      setContext(contextKey, registry);
    },

    registerService<K extends keyof T>(
      key: K,
      service: T[K],
    ): UnregisterService {
      const registry = getContext<ReactiveRegistry<T>>(contextKey);
      registry.register(key, service);
      return () => registry.unregister(key);
    },

    getServices(): T {
      const registry = getContext<ReactiveRegistry<T>>(contextKey);
      return registry.services;
    },
  };
}
