import React, { useState } from 'react';
import styled from 'styled-components';

const DetailsContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  z-index: 20;
  max-height: 80vh;
  overflow-y: auto;
  transition: transform 0.3s ease;
  transform: translateY(${(props) => (props.expanded ? '0' : '65%')});

  @media (min-width: 768px) {
    left: 350px;
    max-width: 500px;
    bottom: 20px;
    right: auto;
    border-radius: 20px;
    transform: none;
    max-height: calc(100vh - 100px);
  }
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const ExpandHandle = styled.div`
  width: 50px;
  height: 4px;
  background-color: #ddd;
  border-radius: 4px;
  margin: 0.5rem auto;
  cursor: pointer;

  @media (min-width: 768px) {
    display: none;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
`;

const InfoSection = styled.div`
  padding: 1rem;
`;

const RestaurantName = styled.h2`
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
`;

const RestaurantMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  background-color: var(--background-light);
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  margin-right: 0.75rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;

  &.cuisine {
    background-color: var(--accent-color);
    color: white;
  }

  &.open {
    background-color: ${(props) =>
      props.isOpen ? 'var(--primary-color)' : 'var(--text-light)'};
    color: white;
  }

  i, svg {
    margin-right: 0.35rem;
  }
`;

const Description = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--text-color);
`;

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Photo = styled.div`
  height: 150px;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: var(--text-color);
`;

const InfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;

  td {
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;

    &:first-child {
      font-weight: 500;
      width: 120px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.a`
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  flex: 1;
  text-align: center;
  transition: var(--transition);
  text-decoration: none;

  &:hover {
    background-color: var(--secondary-color);
  }

  &.secondary {
    background-color: var(--background-light);
    color: var(--text-color);

    &:hover {
      background-color: #e0e0e0;
    }
  }

  i, svg {
    margin-right: 0.5rem;
  }
`;

// Fonction pour déterminer si le restaurant est ouvert (à implémenter en réel)
const isRestaurantOpen = (restaurant) => {
  return restaurant.openNow;
};

function RestaurantDetails({ restaurant, onClose }) {
  const [expanded, setExpanded] = useState(false);

  if (!restaurant) return null;

  const isOpen = isRestaurantOpen(restaurant);
  
  // Prépare l'URL pour Google Maps
  const getDirectionsUrl = () => {
    const destination = encodeURIComponent(restaurant.address);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  return (
    <DetailsContainer expanded={expanded}>
      <ExpandHandle onClick={() => setExpanded(!expanded)} />
      
      <HeaderControls>
        <div></div>
        <CloseButton onClick={onClose}>×</CloseButton>
      </HeaderControls>
      
      <InfoSection>
        <RestaurantName>{restaurant.name}</RestaurantName>
        
        <RestaurantMeta>
          <Badge className="cuisine">{restaurant.cuisine}</Badge>
          <Badge>★ {restaurant.rating.toFixed(1)}</Badge>
          <Badge>{restaurant.price}</Badge>
          <Badge className="open" isOpen={isOpen}>
            {isOpen ? '🟢 Ouvert' : '🔴 Fermé'}
          </Badge>
        </RestaurantMeta>
        
        <Description>{restaurant.description}</Description>
        
        <SectionTitle>Photos</SectionTitle>
        <PhotosGrid>
          {restaurant.photos.map((photo, index) => (
            <Photo key={index}>
              <img src={photo} alt={`${restaurant.name} - ${index + 1}`} />
            </Photo>
          ))}
        </PhotosGrid>
        
        <SectionTitle>Informations</SectionTitle>
        <InfoTable>
          <tbody>
            <tr>
              <td>Adresse</td>
              <td>{restaurant.address}</td>
            </tr>
            <tr>
              <td>Téléphone</td>
              <td>{restaurant.phone}</td>
            </tr>
            <tr>
              <td>Site web</td>
              <td>
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                  {restaurant.website}
                </a>
              </td>
            </tr>
            <tr>
              <td>Horaires</td>
              <td>
                <div>Lundi: {restaurant.hours.monday}</div>
                <div>Mardi: {restaurant.hours.tuesday}</div>
                <div>Mercredi: {restaurant.hours.wednesday}</div>
                <div>Jeudi: {restaurant.hours.thursday}</div>
                <div>Vendredi: {restaurant.hours.friday}</div>
                <div>Samedi: {restaurant.hours.saturday}</div>
                <div>Dimanche: {restaurant.hours.sunday}</div>
              </td>
            </tr>
          </tbody>
        </InfoTable>
        
        <ButtonGroup>
          <ActionButton href={`tel:${restaurant.phone}`} className="secondary">
            📞 Appeler
          </ActionButton>
          <ActionButton href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
            🗺️ Itinéraire
          </ActionButton>
        </ButtonGroup>
      </InfoSection>
    </DetailsContainer>
  );
}

export default RestaurantDetails;
