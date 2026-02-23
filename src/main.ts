import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import wasmService from './services/wasmService';

let start = Date.now();
wasmService.initialize().then(() => {
  let end = Date.now();
  console.log(`WASM service initialized in ${end - start} ms`);
}).catch((error) => {
  console.error('Failed to initialize WASM service:', error);
});

const app = mount(App, {
  target: document.getElementById('app') as HTMLElement,
})

export default app;
