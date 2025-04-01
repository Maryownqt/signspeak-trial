import React from 'react';
import AutoFrameCapture from './components/AutoFrameCapture';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SignSpeak - Real-Time Gesture Recognition</h1>
      </header>
      <main>
        <AutoFrameCapture />
      </main>
    </div>
  );
}

export default App;
