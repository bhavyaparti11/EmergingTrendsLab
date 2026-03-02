# SmartMeal - AI Meal Planning App

## Original Problem Statement
Build a simple web app called SmartMeal that helps users plan meals based on ingredients they have at home. Features include ingredient detection from photos, family profiles with dietary preferences, and AI-powered recipe suggestions focusing on Indian cuisine.

## User Choices
- AI/LLM: OpenAI GPT-5.2 mini (using gpt-5-mini model)
- Database: MongoDB (pre-configured)
- Authentication: Emergent Google OAuth
- Theme: Orange and green color scheme
- Key Features: Ingredient detection from photos, meal customization (veg/non-veg, high protein)

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-5-mini via EmergentIntegrations
- **Auth**: Emergent Google OAuth

## User Personas
1. **Home Cook**: Wants to reduce food waste by using available ingredients
2. **Family Manager**: Needs to accommodate different dietary preferences in one meal plan
3. **Health-Conscious User**: Looks for high-protein, low-carb options

## Core Requirements (Static)
- [x] Ingredient Input via photo upload (AI detection)
- [x] Manual ingredient CRUD operations
- [x] Family profiles with dietary restrictions (veg/non-veg/vegan)
- [x] Spice tolerance settings (mild/medium/hot)
- [x] Preference tags (high-protein, low-carb, etc.)
- [x] Meal query text input
- [x] AI recipe suggestions (3 recipes)
- [x] Recipe cards with ingredients, missing items, steps
- [x] Indian cuisine focus with international options
- [x] Mobile-friendly UI
- [x] Google OAuth login

## What's Been Implemented (Jan 2026)

### Backend (/app/backend/server.py)
- FastAPI server with /api prefix
- Google OAuth via Emergent Auth integration
- Session-based authentication with cookies
- Pantry CRUD endpoints (add, edit, delete ingredients)
- Family CRUD endpoints (add, edit, delete members)
- AI ingredient detection from photos (OpenAI Vision)
- AI recipe suggestions based on pantry + preferences

### Frontend Pages
- Landing page with hero section and Google login
- Dashboard with pantry/family overview
- Pantry management (photo upload, manual add/edit/delete)
- Family profiles (dietary, spice tolerance, preferences)
- Meal Planner with search and recipe cards

### Design
- Orange (#ea580c) and Green (#15803d) theme
- Playfair Display + Inter fonts
- Mobile-first responsive design
- Shadcn UI components

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Core authentication flow
- [x] Pantry CRUD
- [x] Family CRUD
- [x] AI recipe suggestions

### P1 (Important)
- [ ] Image detection for ingredients (endpoint ready, needs real-world testing)
- [ ] Recipe saving/favorites
- [ ] Shopping list generation from missing ingredients

### P2 (Nice to Have)
- [ ] Meal planning calendar
- [ ] Recipe sharing
- [ ] Nutritional information per recipe
- [ ] Voice input for meal queries

## Next Tasks
1. Test image upload flow with real grocery photos
2. Add recipe favorites functionality
3. Generate shopping lists from missing ingredients
4. Add meal history tracking

## Tech Stack Details
- Frontend: React 19, React Router v7, Tailwind CSS v3, Shadcn/UI
- Backend: FastAPI, Motor (async MongoDB), EmergentIntegrations
- Database: MongoDB (test_database)
- AI: OpenAI GPT-5-mini via Emergent LLM Key
