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

const ReviewsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const Review = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const ReviewAuthor = styled.div`
  font-weight: 500;
`;

const ReviewRating = styled.div`
  color: #FFD700;
`;

const ReviewDate = styled.div`
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
`;

const ReviewText = styled.p`
  line-height: 1.5;
  margin: 0;
`;

const LoadingContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--text-light);
`;

// Fonction pour déterminer si le restaurant est ouvert (à implémenter en réel)
const isRestaurantOpen = (restaurant) => {
  return restaurant.openNow;
};

// Formater une date en format lisible
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

function RestaurantDetails({ restaurant, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('infos'); // 'infos', 'reviews', 'photos'

  if (!restaurant) return null;

  const isOpen = isRestaurantOpen(restaurant);
  
  // Prépare l'URL pour Google Maps
  const getDirectionsUrl = () => {
    const destination = encodeURIComponent(restaurant.address || `${restaurant.location.lat},${restaurant.location.lng}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };
  
  // Afficher un message si certaines informations ne sont pas disponibles
  const displayIfAvailable = (info, defaultText = 'Non disponible') => {
    return info || defaultText;
  };

  // Vérifier si le restaurant a des heures d'ouverture
  const hasHours = restaurant.hours && Object.keys(restaurant.hours).length > 0;

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
            {isOpen ? '🟢 Ouvert' : isOpen === false ? '🔴 Fermé' : '⚪ Inconnu'}
          </Badge>
        </RestaurantMeta>
        
        {restaurant.description && (
          <Description>{restaurant.description}</Description>
        )}
        
        {restaurant.photos && restaurant.photos.length > 0 && (
          <>
            <SectionTitle>Photos</SectionTitle>
            <PhotosGrid>
              {restaurant.photos.map((photo, index) => (
                <Photo key={index}>
                  <img src={photo} alt={`${restaurant.name} - ${index + 1}`} />
                </Photo>
              ))}
            </PhotosGrid>
          </>
        )}
        
        <SectionTitle>Informations</SectionTitle>
        <InfoTable>
          <tbody>
            <tr>
              <td>Adresse</td>
              <td>{displayIfAvailable(restaurant.address)}</td>
            </tr>
            <tr>
              <td>Téléphone</td>
              <td>{displayIfAvailable(restaurant.phone)}</td>
            </tr>
            {restaurant.website && (
              <tr>
                <td>Site web</td>
                <td>
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                    {restaurant.website}
                  </a>
                </td>
              </tr>
            )}
            {hasHours && (
              <tr>
                <td>Horaires</td>
                <td>
                  <div>Lundi: {displayIfAvailable(restaurant.hours.monday)}</div>
                  <div>Mardi: {displayIfAvailable(restaurant.hours.tuesday)}</div>
                  <div>Mercredi: {displayIfAvailable(restaurant.hours.wednesday)}</div>
                  <div>Jeudi: {displayIfAvailable(restaurant.hours.thursday)}</div>
                  <div>Vendredi: {displayIfAvailable(restaurant.hours.friday)}</div>
                  <div>Samedi: {displayIfAvailable(restaurant.hours.saturday)}</div>
                  <div>Dimanche: {displayIfAvailable(restaurant.hours.sunday)}</div>
                </td>
              </tr>
            )}
            {restaurant.userRatingsTotal && (
              <tr>
                <td>Avis</td>
                <td>{restaurant.userRatingsTotal} avis</td>
              </tr>
            )}
          </tbody>
        </InfoTable>
        
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <>
            <SectionTitle>Avis des clients</SectionTitle>
            <ReviewsSection>
              {restaurant.reviews.slice(0, 3).map((review, index) => (
                <Review key={index}>
                  <ReviewHeader>
                    <ReviewAuthor>{review.author_name}</ReviewAuthor>
                    <ReviewRating>{'★'.repeat(Math.round(review.rating))}</ReviewRating>
                  </ReviewHeader>
                  <ReviewDate>{formatDate(review.time * 1000)}</ReviewDate>
                  <ReviewText>{review.text}</ReviewText>
                </Review>
              ))}
            </ReviewsSection>
          </>
        )}
        
        <ButtonGroup>
          {restaurant.phone && (
            <ActionButton href={`tel:${restaurant.phone}`} className="secondary">
              📞 Appeler
            </ActionButton>
          )}
          <ActionButton href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
            🗺️ Itinéraire
          </ActionButton>
        </ButtonGroup>
      </InfoSection>
    </DetailsContainer>
  );
}

export default RestaurantDetails;
