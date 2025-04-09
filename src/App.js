import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import RestaurantDetails from './components/RestaurantDetails';
import Tabs from './components/Tabs';
import { 
  searchHalalRestaurants, 
  getTrendingRestaurants, 
  getRestaurantDetails, 
  searchRestaurantsByText, 
  searchRestaurantsByCountry,
  getAvailableCountries
} from './services/placesService';

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
  const [restaurants, setRestaurants] = useState([]);
  const [trendingRestaurants, setTrendingRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris par défaut
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: 'all',
    rating: 0,
    openNow: false,
    country: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);

  // Obtenir la localisation de l'utilisateur
  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("Position utilisateur récupérée:", location);
          setUserLocation(location);
          setCenter(location);
          
          // Charger les restaurants autour de la position utilisateur
          loadRestaurants(location);
        },
        (error) => {
          console.error('Erreur de géolocalisation :', error);
          // Charger quand même les restaurants sur Paris par défaut
          loadRestaurants(center);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('La géolocalisation n\'est pas supportée par ce navigateur.');
      setError('La géolocalisation n\'est pas supportée par ce navigateur.');
      // Charger quand même les restaurants sur Paris par défaut
      loadRestaurants(center);
    }
  };

  // Charger les restaurants depuis l'API
  const loadRestaurants = async (location) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Chargement des restaurants à la position:", location);
      
      // Charger les restaurants normaux
      const restaurantsData = await searchHalalRestaurants(location);
      setRestaurants(restaurantsData);
      
      // Charger les restaurants tendance
      const trendingData = await getTrendingRestaurants(location);
      setTrendingRestaurants(trendingData);
      
      // Récupérer la liste des pays disponibles
      const allRestaurants = [...restaurantsData, ...trendingData];
      const countries = getAvailableCountries(allRestaurants);
      setAvailableCountries(countries);
      
      console.log(`${restaurantsData.length} restaurants et ${trendingData.length} tendances chargés`);
      
    } catch (error) {
      console.error('Erreur lors du chargement des restaurants:', error);
      setError('Impossible de charger les restaurants. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les détails d'un restaurant lorsqu'il est sélectionné
  const handleRestaurantSelect = async (restaurant) => {
    try {
      // Si l'ID est le même que le restaurant déjà sélectionné, simplement fermer le détail
      if (selectedRestaurant && selectedRestaurant.id === restaurant.id) {
        setSelectedRestaurant(null);
        return;
      }
      
      // Vérifier si le restaurant a déjà des détails complets
      if (restaurant.hours && restaurant.photos && restaurant.photos.length > 0) {
        setSelectedRestaurant(restaurant);
      } else {
        // Sinon, charger les détails complets
        const detailedRestaurant = await getRestaurantDetails(restaurant.id);
        setSelectedRestaurant(detailedRestaurant);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails du restaurant:', error);
      // Afficher quand même le restaurant avec les détails limités
      setSelectedRestaurant(restaurant);
    }
  };

  // Effectuer une recherche textuelle
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchRestaurantsByText(query, center, filters.country);
      setRestaurants(searchResults);
      
      // Mettre à jour les pays disponibles
      const countries = getAvailableCountries(searchResults);
      setAvailableCountries(countries);
      
      setActiveTab('restaurants'); // Basculer sur l'onglet restaurants pour afficher les résultats
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Impossible d\'effectuer la recherche. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Effet pour filtrer les restaurants par pays lorsque le filtre change
  useEffect(() => {
    const filterRestaurantsByCountry = async () => {
      if (!userLocation && !center) return;
      
      const location = userLocation || center;
      
      if (filters.country) {
        setLoading(true);
        try {
          // Filtrer les restaurants par pays
          const filteredRestaurants = await searchRestaurantsByCountry(location, filters.country);
          
          if (activeTab === 'restaurants') {
            setRestaurants(filteredRestaurants);
          } else if (activeTab === 'trending') {
            // Pour les tendances, recharger avec le filtre de pays
            const trendingFiltered = await getTrendingRestaurants(location, filters.country);
            setTrendingRestaurants(trendingFiltered);
          }
        } catch (error) {
          console.error('Erreur lors du filtrage par pays:', error);
        } finally {
          setLoading(false);
        }
      } else if (filters.country === null && userLocation) {
        // Si le filtre de pays est réinitialisé, recharger tous les restaurants
        loadRestaurants(location);
      }
    };
    
    filterRestaurantsByCountry();
  }, [filters.country]);

  // Effet initial pour charger les restaurants
  useEffect(() => {
    getUserLocation();
  }, []);

  // Filtrer les restaurants
  const getFilteredRestaurants = () => {
    const restaurantsToFilter = activeTab === 'restaurants' ? restaurants : trendingRestaurants;
    
    return restaurantsToFilter.filter((restaurant) => {
      // Filtre par type de cuisine
      if (filters.cuisine !== 'all' && restaurant.cuisine !== filters.cuisine) {
        return false;
      }
      
      // Filtre par note
      if (restaurant.rating < filters.rating) {
        return false;
      }
      
      // Filtre par ouverture
      if (filters.openNow && restaurant.openNow !== true) {
        return false;
      }
      
      return true;
    });
  };

  const filteredRestaurants = getFilteredRestaurants();

  return (
    <AppContainer>
      <Header 
        getUserLocation={getUserLocation} 
        setCenter={setCenter} 
        onSearch={handleSearch}
      />
      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        restaurantsCount={restaurants.length}
        trendingCount={trendingRestaurants.length}
      />
      <MainContent>
        <Sidebar 
          restaurants={filteredRestaurants}
          setSelectedRestaurant={handleRestaurantSelect}
          filters={filters}
          setFilters={setFilters}
          loading={loading}
          error={error}
          activeTab={activeTab}
          searchQuery={searchQuery}
          availableCountries={availableCountries}
        />
        <Map 
          restaurants={filteredRestaurants}
          selectedRestaurant={selectedRestaurant}
          setSelectedRestaurant={handleRestaurantSelect}
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
