import React, { useState } from 'react';
import styled from 'styled-components';
import { cuisineTypes } from '../data/restaurants';

const SidebarContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--background-white);
  box-shadow: 2px 0 5px var(--shadow-color);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  z-index: 10;
  
  @media (min-width: 768px) {
    width: 350px;
    max-width: 30%;
  }
`;

const FiltersSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
`;

const CuisineFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const CuisineButton = styled.button`
  padding: 0.5rem 0.75rem;
  background-color: ${(props) => 
    props.active ? 'var(--primary-color)' : 'var(--background-light)'};
  color: ${(props) => (props.active ? 'white' : 'var(--text-color)')};
  border-radius: var(--border-radius);
  font-size: 0.85rem;
  transition: var(--transition);
  
  &:hover {
    background-color: ${(props) =>
      props.active ? 'var(--primary-color)' : '#e0e0e0'};
  }
`;

const RatingFilter = styled.div`
  margin-bottom: 1rem;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
`;

const Star = styled.span`
  font-size: 1.5rem;
  color: ${(props) => (props.active ? '#FFD700' : '#e0e0e0')};
  cursor: pointer;
  transition: color 0.2s;
`;

const CheckboxFilter = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  input {
    margin-right: 0.5rem;
  }
`;

const RestaurantsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RestaurantCard = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const RestaurantHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RestaurantImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 0.75rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RestaurantInfo = styled.div`
  flex: 1;
`;

const RestaurantName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-color);
`;

const RestaurantCuisine = styled.p`
  font-size: 0.85rem;
  color: var(--text-light);
  margin: 0;
  text-transform: capitalize;
`;

const RestaurantDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-light);
`;

const RestaurantRating = styled.div`
  display: flex;
  align-items: center;
  
  span {
    margin-left: 0.25rem;
  }
`;

const OpenBadge = styled.span`
  background-color: ${(props) => (props.isOpen ? 'var(--accent-color)' : 'var(--text-light)')};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
`;

function Sidebar({ restaurants, setSelectedRestaurant, filters, setFilters }) {
  // Fonction pour gérer le changement de filtre de cuisine
  const handleCuisineChange = (cuisineId) => {
    setFilters({
      ...filters,
      cuisine: cuisineId,
    });
  };

  // Fonction pour gérer le changement de filtre de note
  const handleRatingChange = (rating) => {
    setFilters({
      ...filters,
      rating,
    });
  };

  // Fonction pour gérer le changement de filtre d'ouverture
  const handleOpenNowChange = (e) => {
    setFilters({
      ...filters,
      openNow: e.target.checked,
    });
  };

  return (
    <SidebarContainer>
      <FiltersSection>
        <FilterTitle>Filtrer par cuisine</FilterTitle>
        <CuisineFilter>
          {cuisineTypes.map((cuisine) => (
            <CuisineButton
              key={cuisine.id}
              active={filters.cuisine === cuisine.id}
              onClick={() => handleCuisineChange(cuisine.id)}
            >
              {cuisine.name}
            </CuisineButton>
          ))}
        </CuisineFilter>

        <FilterTitle>Filtrer par note</FilterTitle>
        <RatingFilter>
          <RatingStars>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                active={star <= filters.rating}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </Star>
            ))}
          </RatingStars>
        </RatingFilter>

        <CheckboxFilter>
          <input
            type="checkbox"
            id="openNow"
            checked={filters.openNow}
            onChange={handleOpenNowChange}
          />
          <label htmlFor="openNow">Ouvert maintenant</label>
        </CheckboxFilter>
      </FiltersSection>

      <RestaurantsList>
        {restaurants.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
            Aucun restaurant ne correspond à vos critères.
          </div>
        ) : (
          restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <RestaurantHeader>
                <RestaurantImage>
                  <img src={restaurant.image} alt={restaurant.name} />
                </RestaurantImage>
                <RestaurantInfo>
                  <RestaurantName>{restaurant.name}</RestaurantName>
                  <RestaurantCuisine>{restaurant.cuisine}</RestaurantCuisine>
                </RestaurantInfo>
              </RestaurantHeader>
              <RestaurantDetails>
                <RestaurantRating>
                  ★<span>{restaurant.rating.toFixed(1)}</span>
                </RestaurantRating>
                <div>
                  {restaurant.price}
                  <OpenBadge isOpen={restaurant.openNow}>
                    {restaurant.openNow ? 'Ouvert' : 'Fermé'}
                  </OpenBadge>
                </div>
              </RestaurantDetails>
            </RestaurantCard>
          ))
        )}
      </RestaurantsList>
    </SidebarContainer>
  );
}

export default Sidebar;
