import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
`;

const CountrySelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid #ddd;
  background-color: white;
  font-size: 0.9rem;
  color: var(--text-color);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const NoCountriesMessage = styled.div`
  font-size: 0.9rem;
  color: var(--text-light);
  padding: 0.5rem 0;
`;

/**
 * Composant de filtre par pays
 * 
 * @param {Array} countries - Liste des pays disponibles
 * @param {string} selectedCountry - Pays actuellement sélectionné
 * @param {Function} onCountryChange - Fonction appelée lors du changement de pays
 */
const CountryFilter = ({ countries, selectedCountry, onCountryChange }) => {
  // Si aucun pays n'est disponible, afficher un message
  if (!countries || countries.length === 0) {
    return (
      <FilterContainer>
        <FilterTitle>Filtrer par pays</FilterTitle>
        <NoCountriesMessage>
          Aucun pays disponible. Effectuez d'abord une recherche de restaurants.
        </NoCountriesMessage>
      </FilterContainer>
    );
  }

  return (
    <FilterContainer>
      <FilterTitle>Filtrer par pays</FilterTitle>
      <CountrySelect 
        value={selectedCountry || 'all'} 
        onChange={(e) => onCountryChange(e.target.value)}
      >
        <option value="all">Tous les pays</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </CountrySelect>
    </FilterContainer>
  );
};

export default CountryFilter;
