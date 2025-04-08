// Service pour les appels à l'API Google Maps Places

// Votre clé API Google
const API_KEY = 'VOTRE_CLE_API_ICI'; // Remplacez par votre clé API Google

/**
 * Recherche des restaurants halal à proximité d'une position
 * @param {object} location - Position {lat, lng}
 * @param {number} radius - Rayon de recherche en mètres (par défaut 5000)
 * @returns {Promise} - Promesse contenant les résultats
 */
export const searchHalalRestaurants = async (location, radius = 5000) => {
  try {
    // Créer l'URL pour l'API Google Places Nearby Search
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=restaurant&keyword=halal&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Erreur API Google Places: ${data.status}`);
    }
    
    // Transformer les résultats dans le format utilisé par l'application
    return data.results.map((place, index) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      cuisine: getCuisineType(place),
      rating: place.rating || 0,
      price: getPriceLevel(place.price_level),
      image: place.photos && place.photos.length > 0 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : 'https://images.unsplash.com/photo-1546833998-877b37c2e4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      openNow: place.opening_hours ? place.opening_hours.open_now : null,
      placeId: place.place_id,
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche de restaurants:", error);
    throw error;
  }
};

/**
 * Obtient les détails d'un restaurant à partir de son ID
 * @param {string} placeId - ID Google Places du restaurant
 * @returns {Promise} - Promesse contenant les détails du restaurant
 */
export const getRestaurantDetails = async (placeId) => {
  try {
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,formatted_phone_number,website,opening_hours,reviews,photos,price_level,types,user_ratings_total&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Erreur API Google Places Details: ${data.status}`);
    }
    
    const place = data.result;
    
    // Formater les heures d'ouverture
    let hours = {};
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    if (place.opening_hours && place.opening_hours.periods) {
      daysOfWeek.forEach((day, index) => {
        const dayPeriods = place.opening_hours.periods.filter(period => period.open.day === index);
        
        if (dayPeriods.length === 0) {
          hours[day] = 'Fermé';
        } else {
          const dayHours = dayPeriods.map(period => {
            const openTime = formatTime(period.open.time);
            const closeTime = period.close ? formatTime(period.close.time) : '00:00';
            return `${openTime} - ${closeTime}`;
          }).join(', ');
          
          hours[day] = dayHours;
        }
      });
    }
    
    // Obtenir les photos
    const photos = place.photos ? place.photos.slice(0, 5).map(photo => (
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${API_KEY}`
    )) : [];
    
    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      cuisine: getCuisineType(place),
      rating: place.rating || 0,
      price: getPriceLevel(place.price_level),
      image: photos.length > 0 ? photos[0] : 'https://images.unsplash.com/photo-1546833998-877b37c2e4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      openNow: place.opening_hours ? place.opening_hours.open_now : null,
      hours,
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      description: '',
      photos,
      reviews: place.reviews || [],
      userRatingsTotal: place.user_ratings_total || 0
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du restaurant:", error);
    throw error;
  }
};

/**
 * Obtenir les tendances de restaurants halal
 * @param {object} location - Position {lat, lng}
 * @returns {Promise} - Promesse contenant les résultats
 */
export const getTrendingRestaurants = async (location) => {
  try {
    // Ici, on peut utiliser rankby=prominence pour obtenir les plus populaires
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&rankby=prominence&type=restaurant&keyword=halal&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Erreur API Google Places: ${data.status}`);
    }
    
    // Transformer et trier par note et nombre d'avis
    const results = data.results
      .map((place) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        cuisine: getCuisineType(place),
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        price: getPriceLevel(place.price_level),
        image: place.photos && place.photos.length > 0 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
          : 'https://images.unsplash.com/photo-1546833998-877b37c2e4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        openNow: place.opening_hours ? place.opening_hours.open_now : null,
        placeId: place.place_id,
      }))
      .sort((a, b) => {
        // Trier d'abord par note, puis par nombre d'avis
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.userRatingsTotal - a.userRatingsTotal;
      });
      
    return results.slice(0, 10); // Retourner les 10 meilleurs
  } catch (error) {
    console.error("Erreur lors de la récupération des tendances:", error);
    throw error;
  }
};

/**
 * Recherche des restaurants halal par mots-clés
 * @param {string} query - Terme de recherche
 * @param {object} location - Position {lat, lng}
 * @returns {Promise} - Promesse contenant les résultats
 */
export const searchRestaurantsByText = async (query, location) => {
  try {
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' halal restaurant')}&location=${location.lat},${location.lng}&radius=10000&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Erreur API Google Places Text Search: ${data.status}`);
    }
    
    // Transformer les résultats
    return data.results.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      cuisine: getCuisineType(place),
      rating: place.rating || 0,
      price: getPriceLevel(place.price_level),
      image: place.photos && place.photos.length > 0 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : 'https://images.unsplash.com/photo-1546833998-877b37c2e4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      openNow: place.opening_hours ? place.opening_hours.open_now : null,
      placeId: place.place_id,
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche de restaurants par texte:", error);
    throw error;
  }
};

// Fonctions utilitaires

/**
 * Détermine le type de cuisine en fonction des types de lieu
 * @param {object} place - Objet lieu Google Places
 * @returns {string} - Type de cuisine
 */
function getCuisineType(place) {
  if (!place.types) {
    return 'divers';
  }
  
  const types = place.types;
  
  if (types.includes('restaurant')) {
    if (types.includes('middle_eastern_restaurant')) return 'méditerranéen';
    if (types.includes('indian_restaurant')) return 'indien';
    if (types.includes('turkish_restaurant')) return 'turc';
    if (types.includes('moroccan_restaurant')) return 'marocain';
    if (types.includes('lebanese_restaurant')) return 'libanais';
    if (types.includes('pakistani_restaurant')) return 'pakistanais';
    if (types.includes('african_restaurant')) return 'africain';
  }
  
  if (types.includes('meal_takeaway') || types.includes('meal_delivery')) {
    return 'fast-food';
  }
  
  return 'divers';
}

/**
 * Convertit le niveau de prix Google en symbole €
 * @param {number} priceLevel - Niveau de prix (0-4)
 * @returns {string} - Symbole de prix
 */
function getPriceLevel(priceLevel) {
  switch (priceLevel) {
    case 0:
    case 1:
      return '€';
    case 2:
      return '€€';
    case 3:
      return '€€€';
    case 4:
      return '€€€€';
    default:
      return '€';
  }
}

/**
 * Formate l'heure depuis le format "hhmm" vers "hh:mm"
 * @param {string} time - Heure au format "hhmm"
 * @returns {string} - Heure au format "hh:mm"
 */
function formatTime(time) {
  const hours = time.substring(0, 2);
  const minutes = time.substring(2, 4);
  return `${hours}:${minutes}`;
}
