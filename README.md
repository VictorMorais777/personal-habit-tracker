# 🪐 Saturn Habit Tracker

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow)

A full-stack habit tracking application built to help users build and maintain better daily routines. Track habits, log check-ins, visualize progress, and (soon) get AI-powered suggestions to stay consistent.

## About

Saturn Habit Tracker lets users create habits with flexible frequencies (daily, weekly, or custom days), check them off as they complete them, and track their progress over time.

This project is open source under the MIT License — feel free to explore, fork, or contribute.

## Tech Stack

**Backend**
- Java 21
- Spring Boot 4.1.1
- Spring Data JPA / Hibernate
- PostgreSQL
- Maven

**Frontend**
- React
- Vite
- React Router
- Axios

## Features

- ✅ User registration
- ✅ Habit creation with custom frequency (daily / weekly / custom days)
- ✅ Daily habit check-ins
- ✅ Landing page
- 🚧 Login / authentication (Spring Security + JWT) — in progress
- 🚧 Progress charts and statistics — planned
- 🚧 AI-powered habit suggestions and goal summaries (Gemini API) — planned

## Getting Started

### Prerequisites

- Java 21
- Node.js
- PostgreSQL

### Backend Setup

1. Navigate to the backend folder:
```bash
   cd site-web-completo
```
2. Create a PostgreSQL database named `site_web_completo`.
3. Set the `DB_PASSWORD` environment variable with your PostgreSQL password.
4. Run the application:
```bash
   ./mvnw spring-boot:run
```
   The backend will start on `http://localhost:8080`.

### Frontend Setup

1. Navigate to the frontend folder:
```bash
   cd frontend
```
2. Install dependencies:
```bash
   npm install
```
3. Start the dev server:
```bash
   npm run dev
```
   The frontend will start on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create a user |
| GET | `/habits/user/{userId}` | List habits for a user |
| POST | `/habits` | Create a habit |
| GET | `/habits/{habitId}/logs` | List check-ins for a habit |
| POST | `/habits/{habitId}/logs` | Create/update a check-in |

## Roadmap

- [ ] User authentication with Spring Security + JWT
- [ ] Habit dashboard UI
- [ ] Progress charts
- [ ] AI-powered habit suggestions (Gemini API)
- [ ] Goal summary reports

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

**Victor Morais**
- GitHub: [@VictorMorais777](https://github.com/VictorMorais777)
- LinkedIn: [João Victor da Silva de Morais](https://linkedin.com/in/joão-victor-da-silva-de-morais)
- Portfolio: [victormorais777.github.io](https://victormorais777.github.io)
