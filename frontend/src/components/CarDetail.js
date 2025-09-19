// frontend/src/components/CarDetail.js

import React, { useState, useEffect } from 'react';
import './CarDetail.css';

const API_URL = process.env.REACT_APP_API_URL;

function CarDetail({ car, onBack }) {
  const [cosmeticSets, setCosmeticSets] = useState([]);

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

  return (
    <div className="car-detail-container">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">← Back to Car List</button>
        <h1>{car.name}</h1>
        <h2>{car.class_name} Class</h2>
      </div>

      <div className="cosmetic-set-list">
        {cosmeticSets.map(set => (
          <div key={set._id.$oid} className="cosmetic-set-card">
            <h3>{set.set_name}</h3>
            {/* Updated image gallery to show 3 images vertically */}
            <div className="image-gallery">
              <figure>
                <figcaption>앞 (Front)</figcaption>
                <img src={set.image_url_front} alt="Front" />
              </figure>
              <figure>
                <figcaption>옆 (Side)</figcaption>
                <img src={set.image_url_side} alt="Side" />
              </figure>
              <figure>
                <figcaption>뒤 (Rear)</figcaption>
                <img src={set.image_url_rear} alt="Rear" />
              </figure>
            </div>
            <h4>Set Effects</h4>
            <p>{set.set_effects}</p>
            <h4>Parts</h4>
            <ul>
              {set.parts.map((part, index) => <li key={index}>{part}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CarDetail;