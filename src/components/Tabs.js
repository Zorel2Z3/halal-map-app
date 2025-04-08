import React from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
  display: flex;
  background-color: var(--background-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
`;

const TabItem = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--primary-color);
    transform: scaleX(${props => props.active ? '1' : '0'});
    transition: transform 0.3s ease;
  }
`;

const TabBadge = styled.span`
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-light)'};
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  margin-left: 0.5rem;
  min-width: 20px;
  text-align: center;
`;

function Tabs({ activeTab, setActiveTab, restaurantsCount, trendingCount }) {
  const tabs = [
    { id: 'restaurants', label: 'Restaurants', count: restaurantsCount },
    { id: 'trending', label: 'Tendances', count: trendingCount },
    { id: 'favorites', label: 'Favoris', count: 0 }, // Sera implémenté plus tard
  ];

  return (
    <TabsContainer>
      {tabs.map(tab => (
        <TabItem
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
          disabled={tab.id === 'favorites'} // Désactiver temporairement l'onglet Favoris
        >
          {tab.label}
          {tab.count > 0 && (
            <TabBadge active={activeTab === tab.id}>
              {tab.count}
            </TabBadge>
          )}
        </TabItem>
      ))}
    </TabsContainer>
  );
}

export default Tabs;
