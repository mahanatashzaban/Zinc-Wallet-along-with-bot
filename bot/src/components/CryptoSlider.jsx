import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CryptoSlider = () => {
  const [cryptos, setCryptos] = useState([]);

  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin,ethereum,ripple,cardano,solana', // Add more as needed
            vs_currencies: 'usd',
            include_last_updated_at: true,
          },
        }
      );
      const data = response.data;
      const cryptoData = Object.keys(data).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        price: data[key].usd,
        last_updated: data[key].last_updated_at,
      }));
      setCryptos(cryptoData);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: '#222',
        color: '#fff',
        overflow: 'hidden',
        padding: '10px 0',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: 'flex',
          animation: 'scroll 30s linear infinite',
        }}
      >
        {cryptos.map((crypto, index) => (
          <div
            key={index}
            style={{
              margin: '0 30px',
              whiteSpace: 'nowrap',
              fontSize: '14px',
            }}
          >
            <strong>{crypto.name}:</strong> ${crypto.price.toLocaleString()}
          </div>
        ))}
        {/* Repeat the list for seamless scrolling */}
        {cryptos.map((crypto, index) => (
          <div
            key={`repeat-${index}`}
            style={{
              margin: '0 30px',
              whiteSpace: 'nowrap',
              fontSize: '14px',
            }}
          >
            <strong>{crypto.name}:</strong> ${crypto.price.toLocaleString()}
          </div>
        ))}
      </div>

      {/* Add keyframes for scrolling animation */}
      <style>
        {`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        `}
      </style>
    </div>
  );
};

export default CryptoSlider;