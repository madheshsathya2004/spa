import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import SpaCard from './SpaCard';
import './index1.css';

const API_BASE_URL = 'http://localhost:5000/api/customer';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [spas, setSpas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchSpas();
    }, 400); // small throttle to avoid too many requests

    return () => clearTimeout(delayTimer);
  }, [searchTerm]);

  const fetchSpas = async () => {
    try {
      setIsLoading(true);

      // Avoid empty query sending `?search=`
      const url =
        searchTerm.trim() === ''
          ? `${API_BASE_URL}/spas`
          : `${API_BASE_URL}/spas?search=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch spas.');
      }

      const data = await response.json();
      setSpas(data);
    } catch (err) {
      console.error("Error loading spas:", err);
      setSpas([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="spa-page-content">

      <h2 className="page-title">🧖 Find Your Perfect Spa</h2>

      <div className="search-container">
        <SearchBar onSearch={setSearchTerm} />
      </div>

      {isLoading ? (
        <p className="text-muted">Loading spas...</p>
      ) : spas.length > 0 ? (
        <div className="spa-card-grid">
          {spas.map(spa => (
            <SpaCard key={spa.id} spa={spa} />
          ))}
        </div>
      ) : (
        <p>No spas found {searchTerm && `matching "${searchTerm}"`}</p>
      )}
    </div>
  );
};

export default HomePage;