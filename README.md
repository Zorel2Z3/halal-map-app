# Halal Map App

Une application web interactive permettant de trouver des restaurants halal autour de soi, avec possibilité de filtrer par pays et cuisines.

## Fonctionnalités

- Carte interactive Google Maps montrant les restaurants halal
- Géolocalisation précise de l'utilisateur
- Recherche de restaurants par nom ou localisation
- Filtrage par pays, type de cuisine, note et statut d'ouverture
- Affichage détaillé des restaurants (adresse, horaires, photos, avis)
- Navigation par onglets (Restaurants, Tendances, Favoris)
- Interface responsive adaptée aux mobiles et ordinateurs

## Installation et configuration

1. Clonez ce dépôt :
```
git clone https://github.com/Zorel2Z3/halal-map-app.git
cd halal-map-app
```

2. Installez les dépendances :
```
npm install
```

3. Configuration de l'API Google Maps :
   - Créez un projet sur [Google Cloud Console](https://console.cloud.google.com/)
   - Activez l'API Maps JavaScript et l'API Places
   - Créez une clé API avec restrictions appropriées
   - Dans le fichier `.env` à la racine du projet, remplacez `VOTRE_CLE_API_ICI` par votre clé API Google Maps :
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=votre_clé_api_google_maps
   REACT_APP_CORS_PROXY=https://cors-anywhere.herokuapp.com/
   ```

4. Configuration du proxy CORS :
   - L'application utilise un proxy CORS pour contourner les restrictions des API Google Maps
   - Par défaut, elle utilise cors-anywhere.herokuapp.com
   - Pour des environnements de production, il est recommandé de mettre en place votre propre proxy CORS

5. Lancez l'application en mode développement :
```
npm start
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000)

## Résolution des problèmes

### Carte qui ne s'affiche pas
- Vérifiez que votre clé API Google Maps est correcte et a les APIs nécessaires activées
- Ouvrez la console développeur pour voir les erreurs spécifiques
- Assurez-vous que la facturation est activée sur votre projet Google Cloud Platform

### Aucun restaurant ne s'affiche
- Vérifiez que l'API Places est bien activée dans votre projet Google Cloud
- Essayez d'augmenter le rayon de recherche
- Vérifiez que le proxy CORS fonctionne correctement

## Déploiement

Pour créer une version de production :
```
npm run build
```

Les fichiers de production seront générés dans le dossier `build`.

## Technologies utilisées

- React.js pour l'interface utilisateur
- Styled Components pour le styling CSS
- Google Maps API pour la carte et les données des restaurants
- Google Places API pour les informations détaillées des restaurants

## Contribuer

1. Fork le projet
2. Créez une nouvelle branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
