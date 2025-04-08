import React, { useState } from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: var(--primary-color);
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }

  h1 {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
  }

  img {
    height: 2.5rem;
    margin-right: 0.75rem;
  }
`;

const SearchBar = styled.div`
  display: flex;
  flex: 1;
  max-width: 600px;
  position: relative;
  margin: 0 1rem;

  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    border: none;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
  }

  button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    font-size: 1.25rem;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 1rem;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const Button = styled.button`
  background-color: var(--accent-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
  margin-left: 0.75rem;
  display: flex;
  align-items: center;

  &:hover {
    background-color: var(--secondary-color);
  }

  svg {
    margin-right: 0.5rem;
  }
`;

function Header({ getUserLocation, setCenter }) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Ici on pourrait implémenter une recherche de lieu avec l'API Google Maps
    console.log('Recherche:', searchValue);
  };

  return (
    <HeaderContainer>
      <Logo>
        <img src="/logo192.png" alt="Halal Map Logo" />
        <h1>Halal Map</h1>
      </Logo>

      <SearchBar>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Rechercher un lieu..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit">
            <i className="fas fa-search">🔍</i>
          </button>
        </form>
      </SearchBar>

      <Actions>
        <Button onClick={getUserLocation}>
          <i className="fas fa-location-arrow">📍</i>
          Ma position
        </Button>
      </Actions>
    </HeaderContainer>
  );
}

export default Header;
