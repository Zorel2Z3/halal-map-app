import React, { useState } from 'react';
import styled from 'styled-components';
import CountryFilter from './CountryFilter';
import { cuisineTypes } from '../data/cuisineTypes';

const SidebarContainer = styled.aside`
  width: 100%;
  max-width: 350px;
  height: 100%;
  background-color: var(--bg-color);
  border-right: 1px solid #e2e2e2;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    max-width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid #e2e2e2;
  }
`;

const RestaurantListHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e2e2;
  position: sticky;
  top: 0;
  background-color: var(--bg-color);
  z-index: 1;
`;

const ResultsTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const ResultsInfo = styled.p`
  font-size: 0.875rem;
  color: var(--text-light);
  margin: 0;
`;

const FiltersContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e2e2;
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
`;

const CuisineSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
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

const StarRatingContainer = styled.div`
  margin-bottom: 1rem;
`;

const StarRatingLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
`;

const StarRatingInput = styled.input`
  margin-right: 0.5rem;
`;

const StarIcon = styled.span`
  color: var(--star-color);
  margin-left: 0.25rem;
`;

const RestaurantList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RestaurantItem = styled.li`
  padding: 1rem;
  border-bottom: 1px solid #e2e2e2;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.selected {
    background-color: var(--selected-color);
  }
`;

const RestaurantName = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
`;

const RestaurantInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-light);
`;

const RestaurantRating = styled.span`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
`;

const RestaurantCuisine = styled.span`
  margin-right: 0.5rem;
`;

const RestaurantPrice = styled.span`
  margin-right: 0.5rem;
`;

const RestaurantStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: ${(props) => (props.isOpen ? '#e1f5e1' : '#f8e0e0')};
  color: ${(props) => (props.isOpen ? '#2e7d32' : '#c62828')};
`;

const ScrollTopButton = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-light);
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
`;

const Sidebar = ({ 
  restaurants, 
  setSelectedRestaurant, 
  filters, 
  setFilters, 
  loading, 
  error,
  activeTab,
  searchQuery,
  availableCountries
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sidebarRef = React.useRef(null);
  
  // Fonction pour mettre à jour les filtres
  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };
  
  // Gérer le défilement
  const handleScroll = (e) => {
    setShowScrollTop(e.target.scrollTop > 300);
  };
  
  // Remonter en haut de la liste
  const scrollToTop = () => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  
  return (
    <SidebarContainer
      ref={sidebarRef}
      onScroll={handleScroll}
    >
      <RestaurantListHeader>
        <ResultsTitle>
          {activeTab === 'restaurants' 
            ? searchQuery 
              ? `Résultats pour "${searchQuery}"`
              : "Restaurants halal à proximité" 
            : "Restaurants tendance"
          }
        </ResultsTitle>
        <ResultsInfo>{restaurants.length} établissements trouvés</ResultsInfo>
      </RestaurantListHeader>
      
      <FiltersContainer>
        <FilterTitle>Filtrer les résultats</FilterTitle>
        
        <CuisineSelect
          value={filters.cuisine}
          onChange={(e) => handleFilterChange('cuisine', e.target.value)}
        >
          {cuisineTypes.map((cuisine) => (
            <option key={cuisine.id} value={cuisine.id}>
              {cuisine.name}
            </option>
          ))}
        </CuisineSelect>
        
        <StarRatingContainer>
          <FilterTitle>Note minimale</FilterTitle>
          {[5, 4, 3, 2, 1].map((rating) => (
            <StarRatingLabel key={rating}>
              <StarRatingInput
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleFilterChange('rating', rating)}
              />
              {rating}
              <StarIcon>★</StarIcon>
              {rating === 1 ? " et plus" : ""}
            </StarRatingLabel>
          ))}
          <StarRatingLabel>
            <StarRatingInput
              type="radio"
              name="rating"
              checked={filters.rating === 0}
              onChange={() => handleFilterChange('rating', 0)}
            />
            Tous
          </StarRatingLabel>
        </StarRatingContainer>
        
        <div style={{ marginBottom: '1rem' }}>
          <StarRatingLabel>
            <StarRatingInput
              type="checkbox"
              checked={filters.openNow}
              onChange={() => handleFilterChange('openNow', !filters.openNow)}
            />
            Ouvert maintenant
          </StarRatingLabel>
        </div>
        
        <CountryFilter 
          countries={availableCountries}
          selectedCountry={filters.country}
          onCountryChange={(country) => handleFilterChange('country', country)}
        />
      </FiltersContainer>
      
      {loading ? (
        <LoadingContainer>
          <div style={{ marginBottom: '1rem' }}>Chargement des restaurants...</div>
          <div className="loader"></div>
        </LoadingContainer>
      ) : error ? (
        <EmptyStateContainer>
          <div style={{ marginBottom: '1rem' }}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </EmptyStateContainer>
      ) : restaurants.length === 0 ? (
        <EmptyStateContainer>
          {activeTab === 'restaurants' ? (
            <>
              <div style={{ marginBottom: '1rem' }}>Aucun restaurant trouvé.</div>
              <div>Essayez de modifier vos filtres ou d'élargir votre zone de recherche.</div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>Aucun restaurant tendance trouvé.</div>
              <div>Essayez une autre localisation ou consultez la liste des restaurants.</div>
            </>
          )}
        </EmptyStateContainer>
      ) : (
        <RestaurantList>
          {restaurants.map((restaurant) => (
            <RestaurantItem
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <RestaurantName>{restaurant.name}</RestaurantName>
              <RestaurantInfo>
                <RestaurantRating>
                  {restaurant.rating.toFixed(1)} <StarIcon>★</StarIcon>
                </RestaurantRating>
                <RestaurantCuisine>{restaurant.cuisine}</RestaurantCuisine>
                <RestaurantPrice>{restaurant.price}</RestaurantPrice>
              </RestaurantInfo>
              <RestaurantInfo>
                {restaurant.openNow !== null && (
                  <RestaurantStatus isOpen={restaurant.openNow}>
                    {restaurant.openNow ? 'Ouvert' : 'Fermé'}
                  </RestaurantStatus>
                )}
                {restaurant.country && restaurant.country !== "Non spécifié" && (
                  <span style={{ marginLeft: '0.5rem' }}>{restaurant.country}</span>
                )}
              </RestaurantInfo>
            </RestaurantItem>
          ))}
        </RestaurantList>
      )}
      
      {showScrollTop && (
        <ScrollTopButton onClick={scrollToTop}>
          ↑
        </ScrollTopButton>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
