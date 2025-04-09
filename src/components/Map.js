import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import styled from 'styled-components';

const MapContainer = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MapErrorContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: var(--border-radius);
  text-align: center;
  max-width: 500px;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const MapSimulation = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--map-background);
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const MapLoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 5;
`;

const LoaderElement = styled.div`
  width: 48px;
  height: 48px;
  border: 5px solid #FFF;
  border-bottom-color: var(--primary-color);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  
  @keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const containerStyle = {
  width: '100%',
  height: '100%',
};

const InfoWindowContent = styled.div`
  padding: 0.25rem;
  max-width: 200px;
`;

const InfoWindowTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const InfoWindowDetails = styled.div`
  font-size: 0.85rem;
  margin-bottom: 0.5rem;

  p {
    margin: 0.25rem 0;
  }
`;

const InfoWindowButton = styled.button`
  padding: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius);
  font-size: 0.85rem;
  width: 100%;
  transition: var(--transition);

  &:hover {
    background-color: var(--secondary-color);
  }
`;

// Simulation des marqueurs si la carte ne charge pas
const RestaurantMarker = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: ${props => props.isOpen ? '#4CAF50' : '#F44336'};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
`;

const UserMarker = styled.div`
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: #4285F4;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const SimulatedInfoWindow = styled.div`
  position: absolute;
  width: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 20;
  transform: translate(-50%, -120%);
  transition: opacity 0.2s ease;

  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`;

const SimulationNotice = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 5;
`;

const RetryButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--secondary-color);
  }
`;

function Map({ restaurants, selectedRestaurant, setSelectedRestaurant, center, userLocation }) {
  // Récupérer la clé API Google Maps depuis les variables d'environnement
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  // Vérifier si une clé API valide est disponible
  const hasValidApiKey = googleMapsApiKey && googleMapsApiKey !== 'VOTRE_CLE_API_ICI';
  
  // Utilisons un mode de simulation si la clé n'est pas valide
  const [useSimulationMode, setUseSimulationMode] = useState(!hasValidApiKey);
  
  // État pour suivre les tentatives de chargement
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Ajouter des logs pour déboguer
  console.log("Initialisation de la carte:", useSimulationMode ? "Mode simulation" : "Mode Google Maps");
  console.log("Clé API configurée:", hasValidApiKey ? "Oui" : "Non");
  console.log("Centre de la carte:", center);
  console.log("Nombre de restaurants à afficher:", restaurants ? restaurants.length : 0);

  // Si nous sommes en mode simulation, nous n'essayons pas de charger Google Maps
  const { isLoaded, loadError } = !useSimulationMode ? useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
    libraries: ['places']
  }) : { isLoaded: false, loadError: null };

  const [map, setMap] = useState(null);
  const [infoWindowRestaurant, setInfoWindowRestaurant] = useState(null);
  const [mapLoading, setMapLoading] = useState(!useSimulationMode);
  const [loadErrorMessage, setLoadErrorMessage] = useState(null);
  
  // Styles personnalisés pour la carte
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.school',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'poi.medical',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'simplified' }],
      },
    ],
  };

  // Référence à la carte pour la centrer lorsque selectedRestaurant change
  const mapRef = useRef(null);
  const simulationRef = useRef(null);

  // Effet pour centrer la carte sur le restaurant sélectionné
  useEffect(() => {
    if (selectedRestaurant && mapRef.current) {
      mapRef.current.panTo({
        lat: selectedRestaurant.location.lat,
        lng: selectedRestaurant.location.lng
      });
      mapRef.current.setZoom(16);
    }
  }, [selectedRestaurant]);

  // Fonction pour réessayer le chargement de la carte
  const retryLoading = () => {
    setLoadAttempts(prev => prev + 1);
    setUseSimulationMode(false);
    setMapLoading(true);
    setLoadErrorMessage(null);
  };

  // Lorsque la carte est chargée
  const onLoad = useCallback((map) => {
    console.log("Google Map chargée avec succès");
    mapRef.current = map;
    setMap(map);
    setMapLoading(false);
  }, []);

  // Lorsque la carte est déchargée
  const onUnmount = useCallback(() => {
    console.log("Carte démontée");
    mapRef.current = null;
    setMap(null);
  }, []);

  // Lorsqu'un marker est cliqué
  const handleMarkerClick = (restaurant) => {
    console.log("Marqueur cliqué:", restaurant.name);
    setInfoWindowRestaurant(restaurant);
  };

  // Lorsque l'infoWindow est fermée
  const handleInfoWindowClose = () => {
    setInfoWindowRestaurant(null);
  };

  // Lorsque l'utilisateur clique sur "Voir détails" dans l'infoWindow
  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setInfoWindowRestaurant(null);
  };

  // Calculer les positions simulées pour les marqueurs
  const getSimulatedPosition = (restaurant, index) => {
    if (!restaurant.location) return { x: 50, y: 50 };
    
    // Si on a un userLocation, on distribue les restaurants autour
    if (userLocation) {
      const angle = (index / (restaurants.length || 1)) * 2 * Math.PI;
      const distance = 20 + Math.random() * 10; // Entre 20% et 30% du centre
      return {
        x: 50 + Math.cos(angle) * distance,
        y: 50 + Math.sin(angle) * distance
      };
    }
    
    // Sinon on distribue de façon plus aléatoire mais organisée
    return {
      x: 30 + (index % 5) * 10 + Math.random() * 5,
      y: 30 + Math.floor(index / 5) * 10 + Math.random() * 5
    };
  };

  // Gérer les erreurs spécifiques de Google Maps
  useEffect(() => {
    if (loadError) {
      console.error("Erreur de chargement de Google Maps:", loadError);
      
      let errorMessage = "Impossible de charger Google Maps.";
      
      // Analyser les messages d'erreur courants et donner des conseils spécifiques
      if (loadError.message && loadError.message.includes("MissingKeyMapError")) {
        errorMessage = "Clé API Google Maps manquante ou invalide.";
      } else if (loadError.message && loadError.message.includes("RefererNotAllowedMapError")) {
        errorMessage = "L'URL de ce site n'est pas autorisée pour cette clé API Google Maps.";
      } else if (loadError.message && loadError.message.includes("InvalidKeyMapError")) {
        errorMessage = "La clé API Google Maps est invalide.";
      } else if (loadError.message && loadError.message.includes("ExpiredKeyMapError")) {
        errorMessage = "La clé API Google Maps a expiré.";
      } else if (loadError.message && loadError.message.includes("ApiNotActivatedMapError")) {
        errorMessage = "L'API Google Maps n'est pas activée pour cette clé.";
      }
      
      setLoadErrorMessage(errorMessage);
      setUseSimulationMode(true);
      setMapLoading(false);
    }
  }, [loadError, loadAttempts]);

  // Si nous sommes en mode simulation, afficher une carte simulée
  if (useSimulationMode) {
    return (
      <MapContainer>
        <MapSimulation ref={simulationRef}>
          {userLocation && (
            <UserMarker style={{ left: '50%', top: '50%' }} />
          )}
          
          {restaurants && restaurants.map((restaurant, index) => {
            const position = getSimulatedPosition(restaurant, index);
            return (
              <React.Fragment key={restaurant.id}>
                <RestaurantMarker 
                  isOpen={restaurant.openNow}
                  style={{ 
                    left: `${position.x}%`, 
                    top: `${position.y}%`,
                    transform: selectedRestaurant && selectedRestaurant.id === restaurant.id
                      ? 'translate(-50%, -50%) scale(1.4)'
                      : 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleMarkerClick(restaurant)}
                />
                
                {infoWindowRestaurant && infoWindowRestaurant.id === restaurant.id && (
                  <SimulatedInfoWindow style={{ left: `${position.x}%`, top: `${position.y}%` }}>
                    <InfoWindowTitle>{infoWindowRestaurant.name}</InfoWindowTitle>
                    <InfoWindowDetails>
                      <p>Cuisine: {infoWindowRestaurant.cuisine}</p>
                      <p>Note: {infoWindowRestaurant.rating.toFixed(1)} ★</p>
                      {infoWindowRestaurant.country && infoWindowRestaurant.country !== "Non spécifié" && (
                        <p>Pays: {infoWindowRestaurant.country}</p>
                      )}
                      <p>
                        {infoWindowRestaurant.openNow 
                          ? '🟢 Ouvert' 
                          : infoWindowRestaurant.openNow === false 
                            ? '🔴 Fermé' 
                            : '⚪ Statut inconnu'
                        }
                      </p>
                    </InfoWindowDetails>
                    <InfoWindowButton
                      onClick={() => handleViewDetails(infoWindowRestaurant)}
                    >
                      Voir détails
                    </InfoWindowButton>
                  </SimulatedInfoWindow>
                )}
              </React.Fragment>
            );
          })}
          <SimulationNotice>
            Mode simulation ⚠️ La carte interactive ne peut pas être chargée
          </SimulationNotice>
        </MapSimulation>
        <MapErrorContainer>
          <h3>La carte n'a pas pu être chargée</h3>
          {loadErrorMessage && <p>{loadErrorMessage}</p>}
          {!loadErrorMessage && <p>Vérifiez que votre clé API Google Maps est correctement configurée et que les APIs nécessaires sont activées.</p>}
          <p>Les APIs requises sont: Maps JavaScript API, Places API, et Geocoding API.</p>
          <RetryButton onClick={retryLoading}>
            Réessayer de charger la carte
          </RetryButton>
        </MapErrorContainer>
      </MapContainer>
    );
  }

  // Si Google Maps est en cours de chargement
  if (!isLoaded) {
    return (
      <MapContainer>
        <MapLoadingContainer>
          <LoaderElement />
          <p style={{ marginTop: '1rem' }}>Chargement de la carte...</p>
        </MapLoadingContainer>
      </MapContainer>
    );
  }

  return (
    <MapContainer>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {mapLoading && (
          <MapLoadingContainer>
            <LoaderElement />
            <p style={{ marginTop: '1rem' }}>Chargement de la carte...</p>
          </MapLoadingContainer>
        )}
        
        {/* Marqueur pour la position de l'utilisateur */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: '/user-location.svg',
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}

        {/* Marqueurs des restaurants */}
        {restaurants && restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={restaurant.location}
            onClick={() => handleMarkerClick(restaurant)}
            animation={
              selectedRestaurant && selectedRestaurant.id === restaurant.id
                ? window.google.maps.Animation.BOUNCE
                : null
            }
            icon={{
              url: restaurant.openNow
                ? '/marker-open.svg'
                : '/marker-closed.svg',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        ))}

        {/* InfoWindow pour le restaurant sélectionné */}
        {infoWindowRestaurant && (
          <InfoWindow
            position={infoWindowRestaurant.location}
            onCloseClick={handleInfoWindowClose}
          >
            <InfoWindowContent>
              <InfoWindowTitle>{infoWindowRestaurant.name}</InfoWindowTitle>
              <InfoWindowDetails>
                <p>Cuisine: {infoWindowRestaurant.cuisine}</p>
                <p>Note: {infoWindowRestaurant.rating.toFixed(1)} ★</p>
                {infoWindowRestaurant.country && infoWindowRestaurant.country !== "Non spécifié" && (
                  <p>Pays: {infoWindowRestaurant.country}</p>
                )}
                <p>
                  {infoWindowRestaurant.openNow 
                    ? '🟢 Ouvert' 
                    : infoWindowRestaurant.openNow === false 
                      ? '🔴 Fermé' 
                      : '⚪ Statut inconnu'
                  }
                </p>
              </InfoWindowDetails>
              <InfoWindowButton
                onClick={() => handleViewDetails(infoWindowRestaurant)}
              >
                Voir détails
              </InfoWindowButton>
            </InfoWindowContent>
          </InfoWindow>
        )}
      </GoogleMap>
    </MapContainer>
  );
}

export default Map;
