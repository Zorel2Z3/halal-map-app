import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import styled from 'styled-components';

const MapContainer = styled.div`
  flex: 1;
  height: 100%;
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

// Vous devrez remplacer cette clé par votre clé API Google Maps valide
const googleMapsApiKey = "VOTRE_CLE_API_ICI";

function Map({ restaurants, selectedRestaurant, setSelectedRestaurant, center, userLocation }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
  });

  const [map, setMap] = useState(null);
  const [infoWindowRestaurant, setInfoWindowRestaurant] = useState(null);

  // Styles personnalisés pour la carte
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    styles: [
      {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  // Référence à la carte pour la centrer lorsque selectedRestaurant change
  const mapRef = useRef(null);

  // Lorsque la carte est chargée
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  // Lorsque la carte est déchargée
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Lorsqu'un marker est cliqué
  const handleMarkerClick = (restaurant) => {
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
  React.useEffect(() => {
    if (selectedRestaurant && mapRef.current) {
      mapRef.current.panTo({
        lat: selectedRestaurant.location.lat,
        lng: selectedRestaurant.location.lng,
      });
      mapRef.current.setZoom(16);
    }
  }, [selectedRestaurant]);

  if (loadError) {
    return <div>Erreur de chargement de la carte</div>;
  }

  if (!isLoaded) {
    return <div>Chargement de la carte...</div>;
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
        {restaurants.map((restaurant) => (
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
                <p>
                  {infoWindowRestaurant.openNow ? '🟢 Ouvert' : '🔴 Fermé'}
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
