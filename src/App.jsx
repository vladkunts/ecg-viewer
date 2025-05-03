import { useState } from 'react'
import EcgChart from './components/EcgChart';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>ECG Viewer</h1>
      <EcgChart />
    </div>
  );
}

export default App
