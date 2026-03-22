# SmartMeal — AI-Powered Meal Planning Platform

SmartMeal is an intelligent meal planning application that helps families make better use of the ingredients they already have. By combining computer vision and large language models, the system converts pantry inputs into personalized, practical meal recommendations.

The platform is designed to reduce food waste, simplify decision-making, and deliver context-aware recipes tailored to household preferences.

---

## Badges

![Status](https://img.shields.io/badge/status-active-success)
![Tech](https://img.shields.io/badge/stack-React%20%7C%20FastAPI%20%7C%20LLM-blue)
![License](https://img.shields.io/badge/license-Academic-lightgrey)

---

## Overview

SmartMeal allows users to:

* Detect ingredients from grocery images using AI
* Manage a dynamic pantry
* Configure family-specific dietary preferences
* Query meals using natural language
* Receive structured, personalized recipe suggestions

The system integrates vision models with LLM-based reasoning to bridge the gap between available ingredients and actionable meal plans.

---

## Core Features

### Ingredient Detection via Image Input

Users can upload images of groceries or pantry items. The backend processes these images using a vision model to extract identifiable ingredients.

### Pantry Management

* Add ingredients manually
* Edit or update items
* Remove outdated entries

### Family Profiles

* Dietary type (Vegetarian / Non-Vegetarian / Vegan)
* Spice tolerance levels
* Multi-user household support

### Natural Language Meal Queries

Examples:

* "Quick dinner for kids"
* "Low spice dish with potatoes"

The system interprets intent and constraints before generating results.

### AI-Based Recipe Generation

Each query returns three curated recipes including:

* Ingredients required
* Missing items
* Step-by-step cooking instructions

### Indian Cuisine Optimization

Designed for Indian households while supporting general recipes.

---

## System Architecture

```
User Input (Image / Text)
        ↓
Frontend (React + Tailwind)
        ↓
Backend API (FastAPI)
        ↓
AI Services Layer
   ├── Vision Model → Ingredient Extraction
   └── LLM → Recipe Generation
        ↓
Database (Firebase / Supabase)
        ↓
Response → Recipe Cards (Frontend)
```

---

## Tech Stack

| Layer             | Technology                      |
| ----------------- | ------------------------------- |
| Frontend          | React, Tailwind CSS             |
| Backend           | FastAPI (Python)                |
| Database          | Firebase / Supabase             |
| LLM Integration   | OpenAI GPT-4 / Anthropic Claude |
| Vision Processing | GPT-4o / Claude Vision          |

---

## Project Structure

```
smartmeal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PantryList.jsx
│   │   │   ├── FamilyProfiles.jsx
│   │   │   ├── MealQuery.jsx
│   │   │   └── RecipeCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Pantry.jsx
│   │   │   └── Profiles.jsx
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── routes/
│   │   ├── ingredients.py
│   │   ├── profiles.py
│   │   └── recipes.py
│   ├── services/
│   │   ├── vision.py
│   │   └── llm.py
│   └── requirements.txt
│
└── README.md
```

---

## Getting Started

### Prerequisites

* Node.js v18+
* Python 3.10+
* Firebase or Supabase project
* OpenAI or Anthropic API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smartmeal.git
cd smartmeal
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
ANTHROPIC_API_KEY=your_key_here
# OR
OPENAI_API_KEY=your_key_here

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS_PATH=./firebase_credentials.json
```

Run the backend server:

```bash
uvicorn main:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_key_here
```

Start the development server:

```bash
npm run dev
```

---

## API Overview

| Endpoint     | Method | Description                 |
| ------------ | ------ | --------------------------- |
| /ingredients | GET    | Fetch pantry items          |
| /ingredients | POST   | Add ingredients             |
| /profiles    | GET    | Fetch family profiles       |
| /profiles    | POST   | Add/update profiles         |
| /recipes     | POST   | Generate recipe suggestions |

---

## Workflow

1. Input ingredients via image upload or manual entry
2. Configure family preferences
3. Submit a natural language meal request
4. Backend processes pantry and preferences
5. AI generates structured recipe suggestions
6. Frontend displays recipe cards

---

## Environment Variables

| Variable                  | Description                  |
| ------------------------- | ---------------------------- |
| ANTHROPIC_API_KEY         | Claude API key (backend)     |
| OPENAI_API_KEY            | OpenAI API key (alternative) |
| FIREBASE_PROJECT_ID       | Firebase project ID          |
| FIREBASE_CREDENTIALS_PATH | Firebase credentials path    |
| VITE_API_URL              | Backend base URL             |
| VITE_FIREBASE_API_KEY     | Firebase API key (frontend)  |

---

## Future Scope

* Automated grocery list generation
* Nutritional analysis and calorie tracking
* Weekly meal planning
* Voice-based interaction
* Mobile application

---

## Team

| Name | Role                  |
| ---- | --------------------- |
| —    | Frontend Development  |
| —    | Backend Development   |
| —    | AI Integration        |
| —    | Database & Deployment |

---

## License

This project is developed for academic purposes.# Here are your Instructions
