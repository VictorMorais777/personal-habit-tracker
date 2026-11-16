# 🪐 Saturn Habit Tracker

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-In%20development-yellow)

A full-stack habit tracker with a social layer. Build daily, weekly or custom-schedule habits, check them off, follow your streaks, share the ones you choose with friends, and get AI-generated suggestions and weekly summaries.

Open source under the MIT License.

<!-- Add screenshots here, e.g. docs/landing.png, docs/habits.png, docs/progress.png -->

## Features

**Habits and progress**
- Habits with a real goal: every day, N times per week, or specific weekdays
- Daily check-ins, with the "done today" state kept in sync with the server
- Streaks that respect each goal (days, weeks, or scheduled days only) and a weekly check-ins chart
- Edit and delete habits (deleting also removes the history)
- Per-habit privacy: public (visible to friends) or private

**Social**
- Profile with bio, location, main goal, social links and a profile photo
- Search users by name, send / accept / decline friend requests
- View a friend's public habits and whether they did them today

**Account**
- Registration, login (JWT) and password recovery by email link
- Light and dark themes (neon orange accent) with a glass-style UI

**AI assistant (Gemini)**
- Habit suggestions based on your current habits and main goal, added with one click
- A short weekly summary written from your real progress numbers
- A daily per-user quota protects the shared free API tier

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 4.1.1, Spring Security, Spring Data JPA / Hibernate, Maven |
| Database | PostgreSQL 18 |
| Frontend | React, Vite, React Router, Axios, Tailwind CSS 4, Recharts |
| Auth | JWT (jjwt), BCrypt |
| AI | Google Gemini API, called only from the backend |

## Security highlights

- Passwords are hashed with BCrypt, with a shared policy (8 to 72 bytes) for sign-up and password reset
- Stateless JWT authentication. Every habit, profile and friendship route checks ownership or friendship on the server (`HabitAccessService`), never trusting the client
- Responses use DTOs: password hashes and email addresses are never returned, and sign-up accepts only name, email and password, so clients cannot set fields such as `id`
- Password reset tokens are 256-bit random values stored only as SHA-256 hashes, single-use, and expire in 30 minutes. The "forgot password" endpoint answers the same way whether or not the email exists
- Profile photos are validated by content (not file extension), checked against a pixel limit, then re-encoded as a 256 px JPEG, which also strips metadata such as GPS coordinates
- Secrets live only in environment variables. CORS is restricted to the frontend origin
- AI: the API key never reaches the browser, only habit data is sent (never name, email or password), model output is validated before it is shown, and AI text is rendered as plain text

## Project structure

```
personal-habit-tracker/
├── site-web-completo/              # Spring Boot backend
│   └── src/main/java/com/example/site_web_completo/
│       ├── config/                 # Security, CORS, JWT
│       ├── controller/             # REST endpoints
│       ├── model/                  # JPA entities and DTOs (model/dto)
│       ├── repository/             # Spring Data repositories
│       └── service/                # Business rules: access control, stats, AI, mail
└── frontend/                       # React + Vite + Tailwind
    └── src/
        ├── pages/                  # Screens
        ├── components/             # Reusable UI (Avatar, ProtectedRoute, ...)
        └── services/               # API client, auth, dates, goal helpers
```

## Getting started

### Prerequisites

- Java 21
- Node.js
- PostgreSQL

### 1. Database

Create a database named `site_web_completo`. Tables are created automatically on startup (`spring.jpa.hibernate.ddl-auto=update`).

### 2. Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_USERNAME` | No | PostgreSQL user (default: `postgres`) |
| `JWT_SECRET` | Yes | Secret used to sign tokens. Use at least 32 random characters, e.g. `openssl rand -base64 48` |
| `GEMINI_API_KEY` | No | Enables the AI assistant. Without it the app runs normally and the AI routes answer "unavailable" |
| `GEMINI_MOCK` | No | Set to `true` to return canned AI responses during local development |

Set them in your IDE run configuration, or in the shell before starting the backend:

```bash
# macOS / Linux
export DB_PASSWORD=your_password
export JWT_SECRET=your_long_random_secret
```

```powershell
# Windows PowerShell
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="your_long_random_secret"
```

Other settings (in `application.properties`): `app.frontend-url`, `app.mail.enabled`, `ai.daily-limit`, `gemini.model`.

### 3. Backend

```bash
cd site-web-completo
./mvnw spring-boot:run      # Windows: .\mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

In development, password reset emails are not sent: the reset link is printed in the backend console (`app.mail.enabled=false`). To send real emails, enable it and configure `spring.mail.*` with SMTP credentials (also through environment variables).

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

## API overview

All routes except `/auth/**` require `Authorization: Bearer <token>`.

**Auth**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account and receive a token |
| POST | `/auth/login` | Log in and receive a token |
| POST | `/auth/forgot-password` | Request a password reset link |
| GET | `/auth/reset-password/validate` | Check whether a reset token is still valid |
| POST | `/auth/reset-password` | Set a new password with a reset token |

**Users**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/{id}` | Own account data (owner only) |
| PUT | `/users/{id}/profile` | Update own profile (owner only) |
| GET | `/users/search?q=` | Search users by name (public profile fields only) |
| GET | `/users/{id}/photo` | Profile photo |
| POST | `/users/me/photo` | Upload own photo |
| DELETE | `/users/me/photo` | Remove own photo |

**Habits and check-ins**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/habits/user/{userId}` | Own habits (all) or a friend's habits (public only) |
| POST | `/habits` | Create a habit |
| PUT | `/habits/{id}` | Update a habit (owner only) |
| DELETE | `/habits/{id}` | Delete a habit and its history (owner only) |
| GET | `/habits/stats?today=` | Streaks and recent check-ins per habit |
| GET | `/habits/{habitId}/logs` | List check-ins of a visible habit |
| POST | `/habits/{habitId}/logs` | Record a check-in (owner only) |

**Friends**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/friends` | List friends |
| GET | `/friends/requests` | Pending requests received |
| POST | `/friends/requests/{userId}` | Send a friend request |
| PUT | `/friends/requests/{id}/accept` | Accept a request |
| DELETE | `/friends/{id}` | Decline, cancel or remove |

**AI assistant**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ai/quota` | Remaining AI uses today |
| POST | `/ai/suggestions` | Suggest new habits |
| POST | `/ai/summary` | Write the weekly summary |

## Privacy note

The AI assistant sends your habit names, descriptions, main goal and progress numbers to Google (Gemini). Your name, email and password are never sent. On the free API tier, Google may use submitted content to improve its products.

## Roadmap

- [x] Authentication, password recovery and hardened registration
- [x] Habits with daily, weekly and custom goals, streaks and progress chart
- [x] Profile, profile photo, friends and public habits
- [x] Light / dark themes and glass UI
- [x] AI habit suggestions and weekly summary
- [ ] Progress page updated for weekly and custom goals
- [ ] Rate limiting on login and password reset requests
- [ ] Invalidate issued tokens when the password changes
- [ ] Case-insensitive emails
- [ ] Multi-language interface (PT-BR, EN, ES, FR, IT, ZH)
- [ ] Premium tier (profile viewers, extended AI)
- [ ] Social login (Google, Microsoft)
- [ ] Automated tests and CI
- [ ] Docker setup, database migrations and deployment

## License

MIT. See the [LICENSE](LICENSE) file.

## Author

**Victor Morais**
- GitHub: [@VictorMorais777](https://github.com/VictorMorais777)
- LinkedIn: [João Victor da Silva de Morais](https://linkedin.com/in/joão-victor-da-silva-de-morais)
- Portfolio: [victormorais777.github.io](https://victormorais777.github.io)
