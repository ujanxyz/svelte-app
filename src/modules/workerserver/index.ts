// runs in worker thread

globalThis.postMessage("Welcome");


self.onmessage = (event: MessageEvent<any>) => {
  const { a, b } = event.data;

  // expensive computation
  const result = a + b;

  self.postMessage({ result });
};
