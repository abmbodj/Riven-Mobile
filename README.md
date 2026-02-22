# Riven

Riven is a feature-rich, full-stack flashcard and study application designed to help users learn efficiently. It combines powerful study tools like spaced repetition and deck organization with social features, gamification (streaks, pets), and a highly customizable UI. It features a responsive web application and a companion mobile app built with React Native.

## Key Features

- **Advanced Card Management**: Create decks, folders, and tags. Support for image-based cards (front/back).
- **Smart Study Modes**: Track study sessions, duration, and accuracy.
- **Social Learning**: Friend system, direct messaging, and ability to share decks via unique codes.
- **Gamification**: Maintain daily streaks and customize a virtual pet with accessories.
- **Customizable UI**: Fully themable interface with user-defined colors and "Botanical Journal" aesthetic.
- **Role-Based Access**: Granular permissions including User, Admin, and Owner roles.
- **Security**: 2FA support using authenticator apps.
- **Cross-Platform**: Accessible via web browser or native mobile app (iOS/Android).

## Tech Stack

- **Language**: JavaScript/TypeScript (Node.js)
- **Web Frontend (`client/`)**: React 19 (Vite), Tailwind CSS, Framer Motion, Lucide React
- **Mobile App (`mobile/`)**: React Native, Expo Router, Zustand
- **Backend (`server/`)**: Express.js 5
- **Database**: PostgreSQL (via `pg` driver)
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt
- **Testing**: Vitest (Unit & Integration for Web and Server)
- **Deployment**: Vercel (Monorepo structure for Web/API), Expo EAS (for Mobile)

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v20 or higher
- **PostgreSQL**: v15 or higher (or a cloud provider like Supabase/Railway)
- **npm** (comes with Node.js)
- **Mobile Development** (Optional but required for `mobile/`):
  - [Expo Go](https://expo.dev/go) app on your physical device, or
  - Xcode (for iOS Simulator)
  - Android Studio (for Android Emulator)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/riven.git
cd riven
```

### 2. Install Dependencies

You need to install dependencies for the root, server, client, and mobile apps.

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install

# Install web client dependencies
cd ../client
npm install

# Install mobile app dependencies
cd ../mobile
npm install
cd ..
```

### 3. Environment Setup

#### Server Configuration
Create a `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env
```

Update `server/.env` with your credentials:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/riven` |
| `JWT_SECRET` | Secret key for signing tokens | `openssl rand -base64 32` output |
| `PORT` | API Server port | `3000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173,http://localhost:3000` |

#### Web Client Configuration
Create a `.env` file in the `client/` directory:

```bash
cp client/.env.example client/.env
```

Update `client/.env`:

| Variable | Description | Default (Dev) |
|----------|-------------|---------------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

#### Mobile Configuration
If your mobile app requires connecting to your local development server, you will need to map the API URL to your machine's IP address (e.g., `http://192.168.1.x:3000/api`) instead of `localhost` so the physical device or emulator can reach it. Set this usually in a `.env` file in the `mobile/` directory (e.g., `EXPO_PUBLIC_API_URL`).

### 4. Database Setup

Riven handles database initialization automatically. When the server starts, it checks for the existence of tables and creates them if missing (including seeding initial roles).

Ensure your PostgreSQL server is running and the database (e.g., `riven`) exists:

```bash
createdb riven
```

### 5. Start Development Servers

You will typically run the complete stack utilizing two terminal windows.

**Terminal 1: Web & API Server**
From the project root, start both the web client and the backend server concurrently:
```bash
npm start
```
- **Server**: `http://localhost:3000`
- **Web Client**: `http://localhost:5173` (Vite)

**Terminal 2: Mobile App**
If you are working on the mobile app, start the Expo development server in a new terminal:
```bash
cd mobile
npm run start
```
Press `i` to open in iOS Simulator, `a` for Android Emulator, or scan the QR code with the Expo Go app on your physical device.

## Architecture

### Directory Structure

```
riven/
├── client/                 # React Web Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   └── ...
│   ├── public/             # Static assets
│   ├── vite.config.js      # Vite configuration
│   └── tailwind.config.js  # Tailwind configuration
├── mobile/                 # React Native / Expo Mobile App
│   ├── app/                # Expo Router screens based routing
│   ├── src/                # Reusable components, hooks, stores
│   ├── assets/             # Images and fonts
│   └── app.json            # Expo configuration
├── server/                 # Express Backend
│   ├── db.js               # Database connection & schema init
│   ├── index.js            # Main application entry point
│   ├── test/               # Backend tests
│   └── package.json
├── package.json            # Root scripts (starts client & server)
└── vercel.json             # Vercel deployment config for Web/API
```

### Request Lifecycle

1.  **Client/Mobile**: User interacts with the React Web UI or React Native Mobile UI.
2.  **API Call**: Frontend application makes an HTTP request to the API URL (e.g., `/api/login`).
3.  **Server**: Express receives the request, parses the JSON body, and authenticates using cookies (Web) or tokens (Mobile).
4.  **Database**: `db.js` executes the appropriate SQL query via the `pg` pool.
5.  **Response**: Server returns JSON data to the requesting client app.

### Database Schema

Key tables include:
- `users`: Stores profile, auth info, and customization settings.
- `decks` / `cards`: Core study content.
- `study_sessions`: Analytics data.
- `messages` / `friendships`: Social features.

Database migrations are currently handled via auto-run SQL checks on server boot in `db.js`.

## Available Scripts

From the root directory:

| Command | Description |
|---------|-------------|
| `npm start` | Runs both web client and backend server in parallel. |
| `npm run server` | Runs only the backend server (with nodemon). |
| `npm run client` | Runs only the web client (with Vite). |

From the `mobile/` directory:

| Command | Description |
|---------|-------------|
| `npm run start` | Start the Expo development server. |
| `npm run ios` | Start Expo and attempt to launch the iOS Simulator. |
| `npm run android` | Start Expo and attempt to launch the Android Emulator. |

## Testing

Testing for the API and Web Client is implemented using **Vitest**.

### Server Tests
```bash
cd server
npm test
```

### Web Client Tests
```bash
cd client
npm test
```

## Deployment

### Vercel (Recommended for Web & API)

This repository is configured for monorepo deployment on Vercel handling both the Web Frontend and Express API.

1.  Push code to GitHub and import the project into Vercel.
2.  **Root Directory**: Leave as `./`.
3.  **Framework Preset**: Vite.
4.  **Environment Variables**: Add all variables from `server/.env` and `client/.env` to the Vercel project settings. Ensure `VITE_API_URL` is set to `/api`.

**Configuration (`vercel.json`):**
```json
{
  "builds": [
    { "src": "server/index.js", "use": "@vercel/node" },
    { "src": "client/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },
    { "src": "/(.*)", "dest": "/client/$1" }
  ]
}
```

### Expo EAS (Recommended for Mobile)

To deploy the mobile application to Android (Play Store) or iOS (App Store), use Expo Application Services (EAS).

1. Install the EAS CLI globally: `npm install -g eas-cli`
2. Login to your Expo account: `eas login`
3. Navigate to the mobile directory: `cd mobile`
4. Configure the project: `eas build:configure`
5. Build the apps:
   - For Android: `eas build --platform android`
   - For iOS: `eas build --platform ios`

## Troubleshooting

### Connection Refused (PostgreSQL)
**Error**: `connect ECONNREFUSED 127.0.0.1:5432`
**Solution**: Ensure PostgreSQL service is running. If using Docker, check container status.

### JWT Error
**Error**: `JsonWebTokenError: invalid signature`
**Solution**: Ensure `JWT_SECRET` in `.env` matches the one used to generate the token (or just restart auth flow after changing secret).

### Mobile App Cannot Reach API
**Error**: `Network Error` or hanging requests on Mobile Simulator/Physical device.
**Solution**: Ensure your `API_URL` uses your computer's local network IP address (e.g., `192.168.1.100`), not `localhost`, because `localhost` refers to the mobile device itself. Ensure your computer's firewall allows incoming connections on port 3000.

### Expo Bundle Issues
**Error**: Weird styling issues or cached stale code in mobile app.
**Solution**: Clear the Expo bundler cache by starting with the clear flag:
```bash
cd mobile
npx expo start -c
```
