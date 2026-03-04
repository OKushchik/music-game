# Music Game Server

TypeScript Express.js сервер з поддержкою аутентифікації, Spotify API та управління музичними треками.

## Features

- ✅ **JWT Authentication** - Access & Refresh tokens
- ✅ **Spotify Integration** - Search, get artist info, albums, top tracks
- ✅ **Song Management** - CRUD операції для музичних треків
- ✅ **User Management** - Регістрація, логін, логаут
- ✅ **Admin Role** - Контроль доступу до певних операцій
- ✅ **TypeScript** - Повна типобезпека
- ✅ **MongoDB** - Зберігання даних користувачів та треків

## Prerequisites

- Node.js (v16+)
- MongoDB Atlas account
- Spotify API credentials (optional, для Spotify функцій)

## Installation

1. **Clone the repository**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` з вашими значеннями:
```env
PORT=8080
MONGO_DB_KEY=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
CLIENT_URL=http://localhost:3000
```

4. **Build TypeScript**
```bash
npm run build
```

## Usage

### Development Mode
```bash
npm run dev
```
Сервер запуститься на `http://localhost:8080` з автоматичною перезагрузкою при змінах коду.

### Production Mode
```bash
npm run build
npm start
```

## API Routes

### Authentication (`/auth`)
- `POST /auth/register` - Регістрація нового користувача
- `POST /auth/login` - Логін користувача
- `POST /auth/logout` - Логаут (видалення токена)
- `GET /auth/me` - Отримати поточного користувача (потребує auth)
- `POST /auth/refresh` - Оновити access token

### Songs (`/songs`) - Потребує authentification
- `GET /songs/get` - Отримати всі пісні
- `GET /songs/get/:id` - Отримати пісню по ID
- `POST /songs/add` - Додати нову пісню
- `PUT /songs/update/:id` - Оновити пісню
- `DELETE /songs/delete/:id` - Видалити пісню (потребує admin)
- `DELETE /songs/delete-many` - Видалити декілька пісень (потребує admin)

### Spotify (`/spotify`)
- `GET /spotify/search?q=query` - Пошук на Spotify
- `GET /spotify/artist/:id` - Інформація про артиста
- `GET /spotify/artist/:id/top-tracks` - Топ треки артиста
- `GET /spotify/artist/:id/albums` - Альбоми артиста

## Project Structure

```
src/
├── controllers/      # Обробники запитів
├── models/          # Mongoose моделі та схеми
├── routes/          # API маршрути
├── services/        # Зовнішні сервіси (Spotify)
├── utils/           # Утиліти (middleware, token generation)
├── database/        # MongoDB підключення
└── index.ts         # Entry point
```

## Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **JWT** - Token-based authentication
- **Axios** - HTTP client
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers

## Security

- Passwords хешуються з bcryptjs (salt 10)
- JWT токени з експіраційним часом
- Access tokens у httpOnly cookies
- Refresh tokens у localStorage (на клієнті)
- CORS налаштована для конкретного домена
- Helmet для безпеки HTTP headers

## Error Handling

Сервер повертає структуровані відповіді:

```json
{
  "success": true/false,
  "message": "Descriptive message",
  "data": {}
}
```

## Deployment

Для деплойменту на production:

1. Побудуйте TypeScript:
```bash
npm run build
```

2. Задайте NODE_ENV=production в `.env`

3. Запустіть production сервер:
```bash
npm start
```

## Troubleshooting

### "Cannot find module"
```bash
npm install
npm run build
```

### Port already in use
Змініть PORT у `.env` або завершіть процес, що займає порт.

### MongoDB connection error
Перевірте `MONGO_DB_KEY` у `.env` та переконайтеся, що IP білижлист дозволяє вашу поточну IP.

### TypeScript compilation errors
```bash
npm install
npm run build
```

## Contributing

1. Напишіть код у TypeScript
2. Переконайтеся, що компіляція успішна: `npm run build`
3. Тестуйте в dev режимі: `npm run dev`

## License

ISC

