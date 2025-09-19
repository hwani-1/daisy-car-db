import React, { useState, useEffect } from 'react';
import './CarList.css';

const API_URL = process.env.REACT_APP_API_URL;

// It now receives an 'onCarSelect' function to call when a car is clicked
function CarList({ onCarSelect }) {
  const [cars, setCars] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars`);
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("Failed to fetch cars:", error);
      }
    };
    fetchCars();
  }, []);

  const carsByClass = cars.reduce((acc, car) => {
    const carClass = car.class_name;
    if (!acc[carClass]) acc[carClass] = [];
    acc[carClass].push(car);
    return acc;
  }, {});

  const carClasses = Object.keys(carsByClass);

  return (
    <div className="car-list-container">
      <h2>Select a Class</h2>
      <div className="class-selector">
        {carClasses.map((carClass) => (
          <button 
            key={carClass} 
            onClick={() => setSelectedClass(carClass)}
            className={`class-button ${selectedClass === carClass ? 'active' : ''}`}
          >
            {carClass}
          </button>
        ))}
      </div>

      {selectedClass && (
        <div className="car-grid">
          {carsByClass[selectedClass].map((car) => (
            // This div is now a button that calls onCarSelect
            <div key={car._id.$oid} className="car-card" onClick={() => onCarSelect(car)}>
              <img src={car.car_image_url} alt={car.name} />
              <h3>{car.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CarList;