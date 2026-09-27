# 📦 StockFlow – Application de gestion commerciale

## 🎯 Objectif

Développer une application web full-stack de gestion commerciale afin de mettre en pratique une architecture basée sur **Angular** et **ASP.NET Core**.

L’objectif principal du projet est de gérer les clients, produits, fournisseurs, commandes et stocks tout en appliquant des règles métier cohérentes, une authentification sécurisée et une séparation claire entre frontend et backend.

---

## 🧠 Contexte

**StockFlow** est un projet personnel réalisé afin de monter en compétence sur une stack **Angular / .NET** et de mettre en pratique le développement d’une application métier complète.

Le projet simule un outil de gestion commerciale permettant à une entreprise de centraliser :

- ses clients
- son catalogue de produits
- ses fournisseurs
- ses commandes
- ses stocks
- ses utilisateurs

L’objectif était également de travailler sur des problématiques allant au-delà d’un simple CRUD :

- architecture frontend / backend
- conception d’une API REST
- authentification
- gestion des rôles
- règles métier
- intégrité des données
- historique des mouvements de stock
- tests automatisés

---

## 🧪 Technologies utilisées

### Frontend

- Angular 22
- TypeScript
- PrimeNG
- PrimeIcons
- Reactive Forms
- Angular Signals
- Angular Router
- HTTP Interceptors
- Functional Guards
- Lazy Loading
- Angular Zoneless

### Backend

- C#
- .NET 10
- ASP.NET Core
- Entity Framework Core
- SQLite
- API REST
- JWT Bearer Authentication
- ASP.NET Core PasswordHasher

### Tests et outils

- xUnit
- SQLite en mémoire pour les tests
- Git
- GitHub
- Visual Studio Code

---

## ⚙️ Fonctionnalités

### Gestion des clients

- ✅ Affichage des clients
- ✅ Création d’un client
- ✅ Modification d’un client
- ✅ Suppression d’un client

### Gestion des produits

- ✅ Création et modification des produits
- ✅ Gestion des références
- ✅ Gestion des catégories
- ✅ Gestion du prix unitaire
- ✅ Définition d’un stock minimum
- ✅ Association d’un fournisseur
- ✅ Détection des produits en stock faible
- ✅ Protection contre la suppression d’un produit déjà utilisé

### Gestion des fournisseurs

- ✅ Affichage des fournisseurs
- ✅ Création d’un fournisseur
- ✅ Modification d’un fournisseur
- ✅ Suppression d’un fournisseur
- ✅ Association fournisseur / produit
- ✅ Protection contre la suppression d’un fournisseur encore utilisé

### Gestion des commandes

- ✅ Création d’une commande pour un client
- ✅ Ajout de plusieurs produits
- ✅ Vérification des quantités disponibles
- ✅ Refus de la commande si le stock est insuffisant
- ✅ Conservation du prix du produit au moment de la commande
- ✅ Consultation du détail d’une commande
- ✅ Validation d’une commande
- ✅ Annulation d’une commande
- ✅ Restauration automatique du stock après annulation

### Gestion des stocks

Le stock ne peut pas être modifié directement depuis la fiche produit.

Toutes les variations passent par des opérations métier historisées.

Types de mouvements pris en charge :

- `Order` : sortie de stock lors d’une commande
- `OrderCancellation` : restauration du stock après annulation
- `Restock` : réapprovisionnement
- `Adjustment` : correction après inventaire

L’application permet également :

- ✅ Réapprovisionnement manuel
- ✅ Ajustement après comptage physique
- ✅ Calcul automatique de l’écart entre le stock enregistré et le stock réel
- ✅ Historique des mouvements de stock
- ✅ Filtrage des mouvements par produit
- ✅ Traçabilité du motif des mouvements

---

## 👤 Authentification et rôles

L’application intègre une authentification basée sur des **tokens JWT**.

### Fonctionnalités mises en place

- ✅ Connexion par nom d’utilisateur et mot de passe
- ✅ Hashage des mots de passe
- ✅ Génération d’un token JWT
- ✅ Ajout automatique du token aux requêtes HTTP
- ✅ Protection des routes Angular
- ✅ Protection des endpoints backend
- ✅ Gestion des rôles `Admin` et `User`

### Administration des utilisateurs

Les administrateurs peuvent :

- consulter la liste des utilisateurs
- créer de nouveaux comptes
- attribuer un rôle `Admin` ou `User`
- modifier le rôle d’un utilisateur
- supprimer un utilisateur

Des règles métier empêchent notamment :

- un administrateur de retirer son propre rôle
- la suppression du dernier administrateur
- la rétrogradation du dernier administrateur
- la suppression de son propre compte
- un utilisateur classique d’accéder à l’administration

---

## 📊 Dashboard

Le tableau de bord affiche des informations calculées à partir des données réelles de l’application :

- chiffre d’affaires
- nombre de commandes
- nombre de clients
- nombre de produits en stock faible

---

## 🗃️ Base de données

Le projet utilise une base de données locale **SQLite** gérée avec **Entity Framework Core**.

### Principales entités

- Client
- Product
- Supplier
- Order
- OrderItem
- StockMovement
- User

### Éléments mis en place

- migrations Entity Framework Core
- relations entre les entités
- persistance des données
- gestion des clés étrangères
- chargement des relations avec Entity Framework Core
- conservation de l’historique des commandes
- conservation de l’historique des mouvements de stock

Le fichier SQLite local n’est pas versionné dans Git.

---

## 🧱 Architecture

StockFlow repose sur une architecture séparant clairement le frontend et le backend.

```text
StockFlow/
├── frontend/
│   └── Application Angular
│
├── backend/
│   ├── StockFlow.Api/
│   │   └── API ASP.NET Core
│   │
│   └── StockFlow.Api.Tests/
│       └── Tests automatisés xUnit
│
└── README.md
```

### Backend

Le backend est notamment structuré autour de :

- Controllers
- Models
- DTOs
- Repositories
- Services
- Entity Framework Core
- Dependency Injection

Les patterns **Repository** et **Unit of Work** sont utilisés afin de structurer l’accès aux données et de centraliser les opérations de persistance.

Les DTOs permettent également de contrôler les données échangées entre l’API et le frontend.

### Frontend

Le frontend utilise notamment :

- composants Angular standalone
- services HTTP
- Reactive Forms
- Angular Signals
- Guards
- Interceptor JWT
- Lazy Loading
- composants PrimeNG

La configuration de l’API est centralisée dans un fichier d’environnement afin d’éviter de coder l’adresse du backend directement dans chaque service.

---

## 🧪 Tests

Une suite de tests automatisés a été mise en place avec **xUnit**.

Les tests utilisent une base **SQLite en mémoire** afin de tester la logique métier avec un fonctionnement proche de la base utilisée par l’application.

Les scénarios couverts concernent notamment :

- ✅ création d’une commande avec un stock suffisant
- ✅ décrémentation automatique du stock
- ✅ création du mouvement de stock associé à une commande
- ✅ refus d’une commande si le stock est insuffisant
- ✅ conservation du stock en cas de commande refusée
- ✅ restauration du stock après annulation
- ✅ création du mouvement de stock d’annulation
- ✅ ajustement d’inventaire
- ✅ absence de mouvement lorsque le stock réel est identique au stock enregistré
- ✅ création d’un utilisateur avec mot de passe hashé
- ✅ protection contre la rétrogradation de son propre compte administrateur

La suite contient actuellement **7 tests automatisés**, tous exécutés avec succès.

Pour lancer les tests :

```bash
cd backend/StockFlow.Api.Tests
dotnet test
```

---

## 🖥️ Interface utilisateur

L’application propose une interface de gestion basée sur **PrimeNG**.

Elle permet de naviguer entre :

- Dashboard
- Clients
- Produits
- Mouvements de stock
- Fournisseurs
- Commandes
- Utilisateurs pour les administrateurs

Les principales opérations utilisent :

- tableaux paginés
- formulaires
- fenêtres modales
- listes déroulantes
- confirmations de suppression
- notifications de succès et d’erreur

L’interface adapte également certains éléments au rôle de l’utilisateur connecté.

Par exemple, la rubrique **Utilisateurs** n’est visible que pour les administrateurs.

---

## 🔐 Sécurité

Plusieurs mesures ont été intégrées au projet :

- hashage des mots de passe
- authentification JWT
- protection des routes Angular
- protection des endpoints ASP.NET Core
- autorisations basées sur les rôles
- clé JWT absente du dépôt Git
- stockage de la clé de développement avec .NET User Secrets
- impossibilité de modifier directement le stock depuis une fiche produit
- règles métier empêchant certaines suppressions incohérentes
- protection du dernier administrateur
- impossibilité pour un administrateur de supprimer son propre compte

---

## 🌐 Configuration de l’API

L’adresse de l’API utilisée par Angular est centralisée dans :

```text
frontend/src/environments/environment.ts
```

Exemple en environnement de développement :

```typescript
export const environment = {
  apiUrl: 'http://localhost:5166/api'
};
```

Cette organisation permet de modifier l’adresse du backend sans avoir à modifier chaque service Angular individuellement.

---

## 🚀 Lancer le projet

### 1. Cloner le repository

```bash
git clone https://github.com/tonpseudo/StockFlow.git
cd StockFlow
```

> L’URL sera à remplacer par celle du repository GitHub définitif.

### 2. Préparer le backend

Se placer dans le projet API :

```bash
cd backend/StockFlow.Api
```

Restaurer les dépendances :

```bash
dotnet restore
```

Configurer la clé JWT de développement :

```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "VotreCleDeDeveloppementSuffisammentLongue"
```

Appliquer les migrations Entity Framework Core :

```bash
dotnet ef database update
```

Démarrer l’API :

```bash
dotnet run
```

L’API de développement utilise actuellement :

```text
http://localhost:5166
```

### 3. Préparer le frontend

Dans un second terminal :

```bash
cd frontend
```

Installer les dépendances :

```bash
npm install
```

Démarrer Angular :

```bash
ng serve
```

L’application est alors accessible sur :

```text
http://localhost:4200
```

---

## ✅ Vérification du projet

### Build Angular

```bash
cd frontend
ng build
```

### Build .NET

```bash
cd backend/StockFlow.Api
dotnet build
```

### Tests automatisés

```bash
cd backend/StockFlow.Api.Tests
dotnet test
```

Les builds frontend et backend ainsi que les tests doivent s’exécuter sans erreur ni avertissement.