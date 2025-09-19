import React, { useState } from 'react';
import './App.css';
import CarList from './components/CarList';
import CarDetail from './components/CarDetail'; // <-- Import the new component

function App() {
  const [selectedCar, setSelectedCar] = useState(null);

  // If a car is selected, show the detail view. Otherwise, show the list.
  return (
    <div className="App">
      <header className="App-header">
        <h1>레이시티 데이지 차량 외형 DB</h1>
      </header>
      <main>
        {selectedCar ? (
          <CarDetail car={selectedCar} onBack={() => setSelectedCar(null)} />
        ) : (
          <CarList onCarSelect={setSelectedCar} />
        )}
      </main>
    </div>
  );
}

export default App;