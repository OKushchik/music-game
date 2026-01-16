# Music Game

A full-stack music game application with user authentication, real-time gameplay, and music management built with modern web technologies.

## 🎮 Features

- **User Authentication**
  - User registration and login with secure password hashing (bcryptjs)
  - JWT-based authentication with access and refresh tokens
  - HttpOnly cookie storage for enhanced security
  - Role-based access control (user/admin)

- **Music Management**
  - Create, read, and delete songs
  - Spotify integration for music discovery
  - Music metadata storage (title, year, link)

- **User Interface**
  - Responsive Material-UI components
  - Real-time form validation
  - Loading states and error handling
  - Emotion/MUI SSR integration for optimal performance

- **State Management**
  - Redux Toolkit for predictable state management
  - Async thunks for API operations
  - Persistent authentication state

## 🛠️ Tech Stack

### Frontend (clientnew)
- **Framework:** Next.js 16
- **Language:** TypeScript
- **UI Library:** Material-UI (MUI) v7
- **Styling:** Emotion, Tailwind CSS
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios with interceptors
- **Styling System:** CSS Modules

### Backend (server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **CORS:** Enabled for cross-origin requests
- **Middleware:** Cookie parser, body parser

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn
- MongoDB (local or Atlas)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Music_Game
```

### 2. Setup Backend (Server)

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# MONGO_DB_KEY=mongodb://localhost:27017/music-game
# JWT_SECRET=your_secret_key
# JWT_REFRESH_SECRET=your_refresh_secret
# CLIENT_URL=http://localhost:3000
# ADMIN_KEY=your_admin_key

# Start development server
npm run dev
```

Server will run on `http://localhost:8080`

### 3. Setup Frontend (Client)

```bash
cd clientnew

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_APP_API_URL=http://localhost:8080" > .env

# Start development server
npm run dev
```

Client will run on `http://localhost:3000`

## 📁 Project Structure

```
Music_Game/
├── server/                      # Backend (Express.js)
│   ├── controllers/
│   │   └── user-controller.js  # Auth logic
│   ├── models/
│   │   ├── user.js             # User schema
│   │   ├── song.js             # Song schema
│   │   └── refreshToken.js     # Refresh token storage
│   ├── routes/
│   │   └── auth-routes.js      # Auth endpoints
│   ├── services/
│   │   └── redisService.js     # Token management (MongoDB-based)
│   ├── utils/
│   │   ├── middleware.js       # Auth middleware
│   │   └── generateToken.js    # JWT generation
│   └── index.js                # Server entry point
│
└── clientnew/                  # Frontend (Next.js)
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx      # Root layout
    │   │   ├── page.tsx        # Home page
    │   │   └── components/
    │   │       └── auth/
    │   │           ├── LoginForm.tsx
    │   │           └── RegisterForm.tsx
    │   ├── services/
    │   │   ├── index.ts        # Axios instance
    │   │   └── api/
    │   │       └── authApi.ts  # Auth API calls
    │   ├── store/
    │   │   ├── store.ts        # Redux store
    │   │   └── slices/
    │   │       └── authSlice.ts
    │   ├── providers/
    │   │   ├── Providers.tsx
    │   │   ├── AuthProvider.tsx
    │   │   └── ReduxProvider.tsx
    │   ├── middleware.ts       # Next.js middleware
    │   └── models/
    │       └── models.ts       # TypeScript interfaces
    └── .env.local              # Environment variables
```

## 🔐 Authentication Flow

### Login/Register
1. User submits credentials via form
2. Frontend dispatches Redux thunk (login/register)
3. API call to backend with `withCredentials: true`
4. Server validates and generates JWT tokens
5. Access token stored in HttpOnly cookie (15 min expiry)
6. Refresh token stored in MongoDB (30 days expiry)
7. Redux state updated with user data
8. Automatic redirect to home page

### Authenticated Requests
1. Frontend makes API request with Axios
2. Axios automatically includes `access_token` cookie
3. Server validates token via `authGuard` middleware
4. Request processed or 401 returned if invalid

### Token Refresh
1. If access token expires (401 response)
2. Axios interceptor automatically calls `/auth/refresh`
3. Server validates refresh token in MongoDB
4. New access token generated and set in cookie
5. Original request retried with new token

### Logout
1. User clicks logout button
2. Frontend dispatches logout thunk
3. API call to `/auth/logout` clears server-side token
4. Cookie cleared on client
5. Redux state reset
6. Redirect to login page

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user (requires auth)
- `GET /auth/me` - Get current user (requires auth)
- `POST /auth/refresh` - Refresh access token

### Songs
- `GET /SongsApiHooks/songs` - Get all songs
- `POST /SongsApiHooks/songs` - Create song (requires auth)
- `DELETE /SongsApiHooks/songs/:id` - Delete song (requires auth, admin)

### Spotify (if configured)
- `GET /spotify/search` - Search Spotify
- `POST /spotify/add` - Add Spotify track

## 🔒 Environment Variables

### Server (.env)
```env
PORT=8080
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_DB_KEY=mongodb://localhost:27017/music-game

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRES_IN=15m

# Admin
ADMIN_KEY=your_admin_secret_key

# Spotify (optional)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Client (.env.local)
```env
NEXT_PUBLIC_APP_API_URL=http://localhost:8080
```

## 🧪 Testing

### Register a new user
```bash
# Via UI: http://localhost:3000/register
# Or via curl:
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get current user (requires auth)
```bash
curl -X GET http://localhost:8080/auth/me \
  -b cookies.txt
```

## 📊 Database Models

### User
```typescript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  passwordHash: String,
  role: 'user' | 'admin',
  avatarUrl: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Song
```typescript
{
  _id: ObjectId,
  title: String,
  year: Number,
  link: String,
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshToken
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  token: String,
  expiresAt: Date (TTL index),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Production Deployment

### Frontend (Vercel recommended)
```bash
npm run build
npm start
```

### Backend (Heroku/Railway/Render)
```bash
npm install
npm start
```

Update environment variables on hosting platform.

## 📝 Available Scripts

### Server
```bash
npm run dev      # Development mode with nodemon
npm start        # Production mode
```

### Client
```bash
npm run dev      # Development mode
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Infinite redirect loop
- Clear browser cookies: DevTools → Application → Cookies → Delete all
- Clear localStorage: `localStorage.clear()` in console
- Hard refresh: `Ctrl+Shift+R`

### "Cannot find module" errors
- Run `npm install` again
- Delete `node_modules` and `npm install`
- Restart dev server

### MongoDB connection error
- Ensure MongoDB is running: `mongod`
- Verify connection string in `.env`
- Check firewall settings

### CORS errors
- Verify `CLIENT_URL` in server `.env` matches your client origin
- Ensure `withCredentials: true` in API calls

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Last Updated:** January 14, 2026
**Version:** 1.0.0
