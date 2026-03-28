import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { NoteTraining } from './components/NoteTraining';
import { ChordTraining } from './components/ChordTraining';
import { Header } from './components/Header';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'note', 'chord'
  const [gameState, setGameState] = useState({
    score: 0,
    streak: 0,
    level: 1,
    experience: 0
  });

  const updateGameState = (newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  return (
    <div className="app">
      <Header
        score={gameState.score}
        streak={gameState.streak}
      />

      <main className="main-content">
        {currentView === 'home' && (
          <Home onStartTraining={(mode) => setCurrentView(mode)} />
        )}

        {currentView === 'note' && (
          <NoteTraining
            onBack={() => setCurrentView('home')}
            onUpdateGameState={updateGameState}
          />
        )}

        {currentView === 'chord' && (
          <ChordTraining
            onBack={() => setCurrentView('home')}
            onUpdateGameState={updateGameState}
          />
        )}
      </main>
    </div>
  );
}

export default App;