# 🌸 BIYODO COSMETICS — Plateforme E-Commerce Complète & Tableau de Bord Administrateur

Application e-commerce haut de gamme et responsive dédiée aux soins cosmétiques et botaniques en Algérie. Le projet est entièrement fonctionnel avec un backend Node.js / Express, une base de données relationnelle MySQL, et une interface moderne Next.js / Tailwind CSS reproduisant l'esthétique épurée et élégante de la marque BIYODO.

---

## 🎨 Charte Graphique & Palette Officielle

L'application utilise scrupuleusement la palette de couleurs BIYODO :

- **Primary (`#54243F`)** : Boutons principaux, en-têtes, navigation, pied de page et éléments cardinaux.
- **Secondary (`#E9A5BE`)** : Promotions, pastilles de réduction, highlights et éléments décoratifs.
- **Background (`#FFF9F7`)** : Arrière-plan doux et chaleureux du site web.
- **Accent (`#F5DCE5`)** : Cartes de catégories, fonds adoucis et éléments secondaires.
- **Text (`#343039`)** : Typographie principale, descriptions et paragraphes.

Devise officielle : **Dinars Algériens (DA)**.

---

## 🏛️ Les Deux Interfaces Principales

Conformément au cahier des charges, l'application est strictement divisée en deux interfaces distinctes :

### 1. 🛍️ Interface Client (Boutique Publique)
**Aucune création de compte ni mot de passe n'est exigée des clientes.**
- **Page d'accueil** : Barre d'annonces (58 wilayas, contact, réseaux), barre de navigation élégante, slider de bannières promotionnelles, sélection par catégorie, grille des soins vedettes, manifeste de la marque.
- **Catalogue & Boutique (`/shop`)** : Recherche en direct, filtres par catégorie, fourchette de prix (DA), tri par popularité ou prix, filtre "en stock uniquement", pagination responsive.
- **Fiche Produit Détaillée (`/product/[idOrSlug]`)** : Galerie photos, calcul de réduction, indicateur de stock restant, sélecteur de quantité avec plafond de stock, onglets de description (ingrédients, conseils, expédition), suggestions de soins associés.
- **Panier d'Achat (`/cart`)** : Persistance automatique dans `localStorage`, ajustement des quantités, estimation des frais de livraison selon la wilaya, application de code promotionnel avec validation en direct côté serveur.
- **Passage en Caisse Express (`/checkout`)** : Formulaire simplifié sans compte (Nom, Téléphone, Wilaya parmi les 58 wilayas, Commune, Adresse), paiement en espèces à la livraison (**Cash on Delivery - COD**), calcul des totaux garanti par le backend.
- **Suivi de Commande (`/track`)** : Suivi sécurisé par Référence (`BYD-YYYYMMDD-XXXX`) et Numéro de téléphone, frise chronologique des statuts de préparation et d'expédition.
- **Pages d'Information** : À propos (`/about`), Contact (`/contact`), FAQ (`/faq`), Confidentialité (`/privacy`), Conditions générales de vente (`/terms`).

### 2. 🛡️ Interface Administrateur (`/admin`)
**Réservée exclusivement à la direction et aux gestionnaires du magasin.**
- **Authentification sécurisée** : Connexion par email/mot de passe avec hash bcrypt et cookies JWT `httpOnly`.
- **Tableau de Bord KPI (`/admin`)** : Chiffre d'affaires total, marge brute bénéficiaire, volume des commandes, alertes stock faible (&lt; 10 unités), valorisation du stock, dernières commandes.
- **Gestion du Catalogue (`/admin/products`)** : Création, modification, activation/désactivation, marquage en "Coup de Cœur", prix de vente, prix remisé, coût d'achat, galerie multi-images, contrôle du stock.
- **Gestion des Catégories (`/admin/categories`)** : Création d'univers cosmétiques, images, slugs automatiques, sécurité empêchant la suppression d'une catégorie contenant encore des soins actifs.
- **Gestion des Commandes (`/admin/orders`)** : Recherche, filtrage par statut et dates, consultation complète du panier client, coordonnées du destinataire, **déduction automatique et unitaire des stocks lors de la confirmation**, restitution automatique lors d'une annulation, assignation de coursier et numéro de suivi, bon de commande imprimable.
- **Gestion des Stocks & Inventaire (`/admin/inventory`)** : Suivi des unités disponibles, alertes rupture, ajustements manuels de stock (entrées, sorties, inventaire physique) avec motif obligatoire, journal d'audit complet de chaque mouvement.
- **Gestion de la Livraison par Wilaya (`/admin/wilayas`)** : Tableau des **58 wilayas d'Algérie**, modification des tarifs de livraison (DA), délais estimés, activation/suspension par région.
- **Gestion des Réductions & Codes Promos (`/admin/coupons`)** : Création de codes en pourcentage ou montant fixe, montant d'achat minimum, plafond d'utilisations, dates d'expiration.
- **Rapports & Statistiques Ventes (`/admin/statistics`)** : Graphiques d'évolution quotidienne et mensuelle du chiffre d'affaires, calcul des marges bénéficiaires réelles (`prix de vente - coût d'achat`), classement des soins les plus vendus, ventilation par univers.

---

## 🗄️ Architecture de la Base de Données Relationnelle (13 Tables)

La base de données MySQL est hautement normalisée et intègre les 13 tables requises :

1. `admins` : Comptes administrateurs (mots de passe hachés bcrypt, rôles).
2. `categories` : Univers et catégories de produits (slug unique, image, statut).
3. `products` : Produits (prix de vente, prix barré, coût d'achat, stock, sku, slug).
4. `product_images` : Galerie d'images par produit (ordre d'affichage, image principale).
5. `customers` : Fichier historique des contacts issus des commandes (aucun mot de passe).
6. `wilayas` : Les 58 wilayas d'Algérie avec tarifs et délais personnalisables.
7. `orders` : Commandes avec référence unique `BYD-...`, sous-total, remise, frais de livraison, total, flag `stock_deducted`.
8. `order_items` : Lignes d'articles figeant le prix de vente et le coût d'achat au moment de la vente (intégrité des rapports financiers).
9. `deliveries` : Données logistiques (coursier, tracking, date de livraison, statut).
10. `payments` : Enregistrement des règlements (méthode COD, statut en attente / payé).
11. `coupons` : Codes promotionnels (type pourcentage/fixe, seuils, validité).
12. `coupon_usages` : Historique d'utilisation des coupons par commande.
13. `inventory_movements` : Journal d'audit de chaque variation de stock (entrée, sortie, déduction commande, restitution, inventaire).

---

## 📁 Structure du Projet

```text
siteweb-ec/
│
├── frontend/                     # Interface Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/                  # Routes client et admin
│   │   │   ├── admin/            # Dashboard, produits, commandes, stock, etc.
│   │   │   ├── product/          # Page détails produit
│   │   │   ├── cart/             # Panier complet
│   │   │   ├── checkout/         # Caisse & validation commande
│   │   │   ├── order-success/    # Confirmation de commande
│   │   │   ├── track/            # Suivi de commande en direct
│   │   │   └── ...               # Pages boutique, accueil, contact, faq
│   │   ├── components/           # Composants réutilisables (Navbar, Cards, Modals)
│   │   ├── context/              # CartContext & AdminAuthContext
│   │   ├── services/             # Client API Axios modulaire
│   │   └── styles/               # globals.css & Tailwind
│   ├── public/
│   └── package.json
│
├── backend/                      # Serveur Node.js & Express REST API
│   ├── src/
│   │   ├── config/               # Pool de connexion MySQL (mysql2/promise)
│   │   ├── controllers/          # Logique métier (commandes, stock, stats, auth)
│   │   ├── middleware/           # Sécurité JWT, validation, upload Multer, erreurs
│   │   ├── routes/               # Routes REST (/api/products, /api/orders, etc.)
│   │   ├── validators/           # Schémas de validation Zod stricts
│   │   ├── scripts/              # Initialisation de la DB & tests E2E
│   │   └── app.js                # Point d'entrée de l'API Express
│   ├── uploads/                  # Fichiers et images uploadés
│   ├── .env                      # Variables d'environnement backend
│   └── package.json
│
├── database/
│   ├── schema.sql                # Schéma DDL relationnel complet (13 tables)
│   └── seeds.sql                 # 58 Wilayas algériennes, 6 catégories, soins et admin
│
├── package.json                  # Scripts racine unifiés
└── README.md
```

---

## 🚀 Guide d'Installation et de Démarrage

### Prérequis
- **Node.js** (v18.x ou supérieur, testé sur Node v26)
- **MySQL Server** (8.0 ou 9.x)

---

### Étape 1 : Configuration des Variables d'Environnement

Le backend utilise le fichier `backend/.env` :

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce_db

JWT_SECRET=biyodo_super_secret_jwt_key_2026_xyz!#secure
JWT_EXPIRES_IN=7d
COOKIE_NAME=biyodo_admin_token

UPLOAD_DIR=uploads
```

Le frontend utilise `frontend/.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME="BIYODO Cosmetics"
NEXT_PUBLIC_CURRENCY="DA"
```

---

### Étape 2 : Initialisation de la Base de Données

Exécutez le script d'initialisation automatique depuis la racine :

```bash
npm run db:init
```

Ce script applique automatiquement `schema.sql` et `seeds.sql`, créant les 13 tables, les **58 wilayas d'Algérie**, les catégories de lancement, les produits de démonstration et le compte administrateur.

---

### Étape 3 : Lancement des Serveurs

Dans deux terminaux distincts :

#### Terminal 1 — Backend API Express (Port 5000)
```bash
npm run dev:backend
```
L'API REST est accessible sur : `http://localhost:5000`  
Santé du serveur : `http://localhost:5000/api/health`

#### Terminal 2 — Frontend Next.js (Port 3000)
```bash
npm run dev:frontend
```
Le site web client est accessible sur : `http://localhost:3000`  
Le tableau de bord administrateur est accessible sur : `http://localhost:3000/admin`

---

## 🔑 Identifiants Administrateur par Défaut

- **URL de connexion** : `http://localhost:3000/admin/login`
- **Email** : `admin@biyodo.com`
- **Mot de passe** : `admin123`

---

## 🧪 Tests et Vérifications Automatisés

Un script de test d'intégration de bout en bout (E2E) est inclus pour valider le flux complet :

```bash
node backend/src/scripts/verifyE2E.js
```

Ce script teste de façon automatisée :
1. La santé de l'API REST.
2. Le chargement des produits et des 58 wilayas.
3. La validation d'un code promotionnel (`BIYODO10`).
4. La création d'une commande client sans compte.
5. Le calcul rigoureux des totaux côté serveur.
6. Le suivi de commande en direct par référence et téléphone.
7. L'authentification administrateur JWT.
8. La confirmation de commande par l'administrateur avec **déduction automatique et unitaire des stocks**.
9. L'enregistrement du mouvement dans le journal d'audit de l'inventaire.
10. La mise à jour des statistiques financières et de la marge brute.

---

## 🛡️ Mesures de Sécurité Appliquées

- **Hachage des mots de passe** : Utilisation de `bcryptjs` avec 10 tours de sel.
- **Authentification administrateur** : Tokens JWT sécurisés transmis via cookies `httpOnly` et en-têtes Authorization.
- **Protection des données financières** : Les totaux des commandes sont strictement calculés sur le backend à partir des prix en base de données ; aucun montant provenant du client n'est pris pour argent comptant.
- **Transactions SQL** : Les créations de commande et déductions de stock s'exécutent au sein de transactions atomiques ACID (`withTransaction`), garantissant zéro incohérence de stock.
- **Sécurité HTTP** : Headers `Helmet`, CORS configuré, limitation de taille des payloads et validation Zod de chaque entrée utilisateur.