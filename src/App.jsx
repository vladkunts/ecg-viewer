import { useState, useEffect } from 'react'
import EcgChart from './components/EcgChart';
import LorenzPlot from './components/LorenzPlot';
import './App.css';

function App() {
  const [signals, setSignals] = useState([]);
  const [beatData, setBeatData] = useState([]);

  useEffect(() => {
    fetch('/ecg_graph_dto_realistic.json')
      .then(res => res.json())
      .then(data => {
        setSignals(data.signals);
        setBeatData(data.beats);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>ECG Viewer</h1>
      <EcgChart signals={signals} beatData={beatData} setBeatData={setBeatData} />
      <LorenzPlot signals={signals} beats={beatData} />
    </div>
  );
}

export default App
