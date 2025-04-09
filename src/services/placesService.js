// Service pour les appels à l'API Google Maps Places

// Récupérer les clés d'API depuis les variables d'environnement
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const CORS_PROXY = process.env.REACT_APP_CORS_PROXY || 'https://cors-anywhere.herokuapp.com/';

/**
 * Recherche des restaurants halal à proximité d'une position
 * @param {object} location - Position {lat, lng}
 * @param {number} radius - Rayon de recherche en mètres (par défaut 5000)
 * @returns {Promise} - Promesse contenant les résultats
 */
export const searchHalalRestaurants = async (location, radius = 5000) => {
  try {
    console.log(`Recherche de restaurants halal à ${location.lat},${location.lng} dans un rayon de ${radius}m`);
    
    // Utiliser l'API de recherche à proximité de Google Places
    const url = `${CORS_PROXY}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=restaurant&keyword=halal&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Statut de la réponse API: ${data.status}, ${data.results ? data.results.length : 0} résultats trouvés`);
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Erreur API Google Places: ${data.status} - ${data.error_message || 'Aucun message d\'erreur'}`);
    }
    
    // Si aucun résultat, retourner un tableau vide
    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      return [];
    }
    
    // Transformer les résultats en format utilisé par l'application
    const processedResults = [];
    
    for (const place of data.results) {
      try {
        // Récupérer le pays avec l'API de géocodage inverse
        const placeDetails = await getPlaceDetails(place.place_id);
        const country = extractCountryFromDetails(placeDetails);
        
        processedResults.push({
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
          country: country
        });
      } catch (error) {
        console.error(`Erreur de traitement pour le restaurant ${place.name}:`, error);
      }
    }
    
    return processedResults;
  } catch (error) {
    console.error("Erreur lors de la recherche de restaurants:", error);
    throw error;
  }
};

/**
 * Recherche des restaurants halal filtrés par pays
 * @param {object} location - Position {lat, lng} 
 * @param {string} country - Pays à filtrer (optionnel)
 * @returns {Promise} - Promesse contenant les résultats filtrés par pays
 */
export const searchRestaurantsByCountry = async (location, country) => {
  try {
    // Obtenir tous les restaurants
    const allRestaurants = await searchHalalRestaurants(location);
    
    // Si pas de pays spécifié, retourner tous les restaurants
    if (!country || country === 'all') {
      return allRestaurants;
    }
    
    // Filtrer par pays
    return allRestaurants.filter(restaurant => 
      restaurant.country && 
      restaurant.country.toLowerCase() === country.toLowerCase()
    );
  } catch (error) {
    console.error("Erreur lors de la recherche de restaurants par pays:", error);
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
    console.log(`Récupération des détails pour le lieu ID: ${placeId}`);
    
    const url = `${CORS_PROXY}https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,formatted_phone_number,website,opening_hours,reviews,photos,price_level,types,user_ratings_total,address_components&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Statut de la réponse API détails: ${data.status}`);
    
    if (data.status !== 'OK') {
      throw new Error(`Erreur API Google Places Details: ${data.status} - ${data.error_message || 'Aucun message d\'erreur'}`);
    }
    
    const place = data.result;
    const country = extractCountryFromDetails(place);
    
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
      userRatingsTotal: place.user_ratings_total || 0,
      country: country
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du restaurant:", error);
    throw error;
  }
};

/**
 * Obtient les détails d'un lieu
 * @param {string} placeId - ID Google Places
 * @returns {Promise} - Détails du lieu
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const url = `${CORS_PROXY}https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Erreur API Google Places Details: ${data.status}`);
    }
    
    return data.result;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails:", error);
    return null;
  }
};

/**
 * Extrait le pays à partir des composants d'adresse
 * @param {object} details - Détails du lieu avec address_components
 * @returns {string} - Nom du pays ou "Non spécifié"
 */
function extractCountryFromDetails(details) {
  if (!details || !details.address_components) {
    return "Non spécifié";
  }
  
  const countryComponent = details.address_components.find(
    component => component.types.includes('country')
  );
  
  return countryComponent ? countryComponent.long_name : "Non spécifié";
}

/**
 * Obtenir les tendances de restaurants halal
 * @param {object} location - Position {lat, lng}
 * @param {string} country - Pays pour filtrer (optionnel)
 * @returns {Promise} - Promesse contenant les résultats
 */
export const getTrendingRestaurants = async (location, country = null) => {
  try {
    console.log(`Récupération des restaurants tendance près de ${location.lat},${location.lng}`);
    
    // Ici, on peut utiliser rankby=prominence pour obtenir les plus populaires
    const url = `${CORS_PROXY}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&rankby=prominence&type=restaurant&keyword=halal&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Statut de la réponse API tendances: ${data.status}, ${data.results ? data.results.length : 0} résultats trouvés`);
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Erreur API Google Places: ${data.status} - ${data.error_message || 'Aucun message d\'erreur'}`);
    }
    
    // Si aucun résultat, retourner un tableau vide
    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      return [];
    }
    
    // Transformer et trier par note et nombre d'avis
    const results = [];
    
    for (const place of data.results) {
      try {
        // Récupérer le pays avec l'API de géocodage inverse
        const placeDetails = await getPlaceDetails(place.place_id);
        const placeCountry = extractCountryFromDetails(placeDetails);
        
        // Si un pays est spécifié et ne correspond pas, ignorer ce restaurant
        if (country && placeCountry !== country) {
          continue;
        }
        
        results.push({
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
          country: placeCountry
        });
      } catch (error) {
        console.error(`Erreur de traitement pour le restaurant tendance ${place.name}:`, error);
      }
    }
    
    // Trier par note puis par nombre d'avis
    results.sort((a, b) => {
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
 * @param {string} country - Pays pour filtrer (optionnel)
 * @returns {Promise} - Promesse contenant les résultats
 */
export const searchRestaurantsByText = async (query, location, country = null) => {
  try {
    console.log(`Recherche textuelle pour "${query}" près de ${location.lat},${location.lng}`);
    
    const url = `${CORS_PROXY}https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' halal restaurant')}&location=${location.lat},${location.lng}&radius=10000&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Statut de la réponse API recherche textuelle: ${data.status}, ${data.results ? data.results.length : 0} résultats trouvés`);
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Erreur API Google Places Text Search: ${data.status} - ${data.error_message || 'Aucun message d\'erreur'}`);
    }
    
    // Si aucun résultat, retourner un tableau vide
    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      return [];
    }
    
    // Transformer les résultats
    const results = [];
    
    for (const place of data.results) {
      try {
        // Récupérer le pays avec l'API de géocodage inverse
        const placeDetails = await getPlaceDetails(place.place_id);
        const placeCountry = extractCountryFromDetails(placeDetails);
        
        // Si un pays est spécifié et ne correspond pas, ignorer ce restaurant
        if (country && placeCountry !== country) {
          continue;
        }
        
        results.push({
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
          country: placeCountry
        });
      } catch (error) {
        console.error(`Erreur de traitement pour le restaurant recherche ${place.name}:`, error);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Erreur lors de la recherche de restaurants par texte:", error);
    throw error;
  }
};

/**
 * Obtenir la liste des pays disponibles à partir d'une liste de restaurants
 * @param {Array} restaurants - Liste des restaurants
 * @returns {Array} - Liste des pays uniques
 */
export const getAvailableCountries = (restaurants) => {
  if (!restaurants || restaurants.length === 0) {
    return [];
  }
  
  // Extraire les pays uniques
  const countries = restaurants
    .map(restaurant => restaurant.country)
    .filter(country => country && country !== "Non spécifié"); // Filtrer les valeurs nulles ou non spécifiées
  
  // Supprimer les doublons
  return [...new Set(countries)].sort();
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
