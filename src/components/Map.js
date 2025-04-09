import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import styled from 'styled-components';

const MapContainer = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
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
  max-width: 300px;
  z-index: 10;
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

function Map({ restaurants, selectedRestaurant, setSelectedRestaurant, center, userLocation }) {
  // Récupérer la clé API Google Maps depuis les variables d'environnement
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  // Ajouter des logs pour déboguer
  console.log("Initialisation de la carte avec la clé API:", googleMapsApiKey ? "Clé API définie" : "Clé API manquante");
  console.log("Centre de la carte:", center);
  console.log("Nombre de restaurants à afficher:", restaurants ? restaurants.length : 0);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [infoWindowRestaurant, setInfoWindowRestaurant] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

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

  // Centrer la carte sur le restaurant sélectionné
  useEffect(() => {
    if (selectedRestaurant && mapRef.current && selectedRestaurant.location) {
      console.log("Centrage sur le restaurant sélectionné:", selectedRestaurant.name);
      mapRef.current.panTo({
        lat: selectedRestaurant.location.lat,
        lng: selectedRestaurant.location.lng,
      });
      mapRef.current.setZoom(16);
    }
  }, [selectedRestaurant]);

  // Ajuster les limites de la carte pour montrer tous les restaurants
  useEffect(() => {
    if (map && restaurants && restaurants.length > 0 && !selectedRestaurant) {
      try {
        console.log("Ajustement des limites de la carte pour", restaurants.length, "restaurants");
        const bounds = new window.google.maps.LatLngBounds();
        let validLocationsCount = 0;
        
        restaurants.forEach(restaurant => {
          if (restaurant.location && restaurant.location.lat && restaurant.location.lng) {
            bounds.extend(new window.google.maps.LatLng(
              restaurant.location.lat,
              restaurant.location.lng
            ));
            validLocationsCount++;
          }
        });
        
        // Si l'utilisateur a partagé sa position, l'inclure dans les limites
        if (userLocation) {
          bounds.extend(new window.google.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          ));
          validLocationsCount++;
        }
        
        console.log("Nombre de localisations valides:", validLocationsCount);
        
        if (validLocationsCount > 0) {
          map.fitBounds(bounds);
          
          // Si les limites sont trop petites (un seul point), zoomer
          const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
            const zoom = map.getZoom();
            console.log("Zoom après ajustement des limites:", zoom);
            if (zoom > 15) {
              map.setZoom(15);
            }
          });
          
          return () => {
            window.google.maps.event.removeListener(listener);
          };
        }
      } catch (error) {
        console.error("Erreur lors de l'ajustement des limites de la carte:", error);
      }
    }
  }, [map, restaurants, userLocation, selectedRestaurant]);

  if (loadError) {
    console.error("Erreur de chargement de Google Maps:", loadError);
    return (
      <MapContainer>
        <MapErrorContainer>
          <h3>Erreur de chargement de la carte</h3>
          <p>Impossible de charger Google Maps. Veuillez vérifier votre connexion, votre clé API ou réessayer plus tard.</p>
          <p>Détail de l'erreur: {loadError.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer'
            }}
          >
            Rafraîchir la page
          </button>
        </MapErrorContainer>
      </MapContainer>
    );
  }

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
