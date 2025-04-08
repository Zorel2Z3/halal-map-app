import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import RestaurantDetails from './components/RestaurantDetails';
import { restaurantsData } from './data/restaurants';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

function App() {
  const [restaurants] = useState(restaurantsData);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris par défaut
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: 'all',
    rating: 0,
    openNow: false,
  });

  // Obtenir la localisation de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setCenter(location);
        },
        (error) => {
          console.error('Erreur de géolocalisation :', error);
        }
      );
    } else {
      console.error('La géolocalisation n\'est pas supportée par ce navigateur.');
    }
  };

  // Filtrer les restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Filtre par type de cuisine
    if (filters.cuisine !== 'all' && restaurant.cuisine !== filters.cuisine) {
      return false;
    }
    
    // Filtre par note
    if (restaurant.rating < filters.rating) {
      return false;
    }
    
    // Filtre par ouverture
    if (filters.openNow && !restaurant.openNow) {
      return false;
    }
    
    return true;
  });

  return (
    <AppContainer>
      <Header getUserLocation={getUserLocation} setCenter={setCenter} />
      <MainContent>
        <Sidebar 
          restaurants={filteredRestaurants} 
          setSelectedRestaurant={setSelectedRestaurant}
          filters={filters}
          setFilters={setFilters}
        />
        <Map 
          restaurants={filteredRestaurants}
          selectedRestaurant={selectedRestaurant}
          setSelectedRestaurant={setSelectedRestaurant}
          center={center}
          userLocation={userLocation}
        />
        {selectedRestaurant && (
          <RestaurantDetails 
            restaurant={selectedRestaurant} 
            onClose={() => setSelectedRestaurant(null)} 
          />
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
