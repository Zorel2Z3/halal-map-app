# Halal Map App

Une application web interactive permettant de trouver des restaurants halal autour de soi.

## Fonctionnalités

- Carte interactive Google Maps montrant les restaurants halal
- Géolocalisation précise de l'utilisateur
- Recherche de restaurants par nom ou localisation
- Filtrage par type de cuisine, note et statut d'ouverture
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
   - Ouvrez `src/components/Map.js` et `src/services/placesService.js`
   - Remplacez `VOTRE_CLE_API_ICI` par votre clé API Google Maps

4. Lancez l'application en mode développement :
```
npm start
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000)

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
