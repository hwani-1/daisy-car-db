// frontend/src/components/CarDetail.js

import React, { useState, useEffect } from 'react';
import './CarDetail.css';

const API_URL = process.env.REACT_APP_API_URL;

function CarDetail({ car, onBack }) {
  const [cosmeticSets, setCosmeticSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null); // <-- New state to track the selected set

  useEffect(() => {
    const fetchCosmeticSets = async () => {
      if (!car) return;
      try {
        const response = await fetch(`${API_URL}/api/cosmetic_sets/${car._id.$oid}`);
        const data = await response.json();
        setCosmeticSets(data);
      } catch (error) {
        console.error("Failed to fetch cosmetic sets:", error);
      }
    };
    fetchCosmeticSets();
  }, [car]);

  // If a set is selected, show its details
  if (selectedSet) {
    return (
      <div className="car-detail-container">
        <div className="detail-header">
          {/* This button now goes back to the set list */}
          <button onClick={() => setSelectedSet(null)} className="back-button">← Back to Set List</button>
          <h1>{selectedSet.set_name}</h1>
          <h2>{car.name}</h2>
        </div>
        <div className="cosmetic-set-card">
          <div className="image-gallery">
            <figure>
              <figcaption>앞 (Front)</figcaption>
              <img src={selectedSet.image_url_front} alt="Front" />
            </figure>
            <figure>
              <figcaption>옆 (Side)</figcaption>
              <img src={selectedSet.image_url_side} alt="Side" />
            </figure>
            <figure>
              <figcaption>뒤 (Rear)</figcaption>
              <img src={selectedSet.image_url_rear} alt="Rear" />
            </figure>
          </div>
          <h4>Set Effects</h4>
          <p>{selectedSet.set_effects}</p>
          <h4>Parts</h4>
          <ul>
            {selectedSet.parts.map((part, index) => <li key={index}>{part}</li>)}
          </ul>
        </div>
      </div>
    );
  }

  // If no set is selected, show the list of sets
  return (
    <div className="car-detail-container">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">← Back to Car List</button>
        <h1>{car.name}</h1>
        <h2>Select a Cosmetic Set</h2>
      </div>

      <div className="set-selector-grid">
        {cosmeticSets.map(set => (
          <button key={set._id.$oid} className="set-button" onClick={() => setSelectedSet(set)}>
            <img src={set.set_image_url || car.car_image_url} alt={set.set_name} />
            <span>{set.set_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CarDetail;