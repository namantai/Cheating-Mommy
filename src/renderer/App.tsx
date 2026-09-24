import { applicationName } from '../shared/app-info';

export function App() {
  return (
    <main className="app">
      <h1>{applicationName}</h1>
      <p>App initialized</p>
    </main>
  );
}
