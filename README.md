
prompt :
make sure you are not duplicating anything 
# Avacasa Real Estate CRM

A comprehensive Real Estate CRM system with frontend and backend authentication.

## Project Structure


```
crm/
├── backend/              # Node.js/Express + TypeScript backend
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Auth middleware
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utilities
│   │   └── server.ts     # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/             # React 18 + Vite + TypeScript frontend
    ├── src/
    │   ├── components/
    │   │   └── auth/     # Auth components
    │   ├── hooks/        # Custom React hooks
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   ├── store/        # Redux store
    │   ├── types/        # TypeScript types
    │   ├── utils/        # Utilities
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── .env.development
```

## Backend Setup

### Prerequisites
- Node.js 16+
- MongoDB running locally or connection string

### Installation

```bash
cd backend
npm install
```

### Configuration

Create a `.env` file from `.env.example`:

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/avacasa-crm
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BCRYPT_ROUNDS=10
```

### Development

```bash
npm run dev
```

This will start the server with TypeScript compilation and auto-reload.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

This will start the Vite dev server at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

### Frontend (.env.development)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Frontend (.env.production)

```env
VITE_API_BASE_URL=https://api.avacasa.com/api
VITE_SOCKET_URL=https://api.avacasa.com
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-token` - Verify JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

## Features Implemented

### Backend
- ✅ User registration with role-based access control
- ✅ JWT authentication with token management
- ✅ MongoDB integration with Mongoose
- ✅ WebSocket support (Socket.io)
- ✅ TypeScript strict mode
- ✅ Error handling middleware
- ✅ CORS support

### Frontend
- ✅ Login/Register pages
- ✅ Protected routes with authentication
- ✅ Redux state management
- ✅ Axios HTTP client with interceptors
- ✅ WebSocket connection setup
- ✅ TypeScript strict mode
- ✅ Responsive UI components

## Authentication Flow

1. User registers or logs in
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage and Redux
4. Token is automatically sent with all API requests
5. WebSocket connection is established with the token
6. Protected routes check authentication status
7. On 401 error, user is redirected to login

## User Roles

- **Admin**: Full access to all resources
- **Developer**: Can manage projects and inventory
- **Sales Agent**: Can manage leads, customers, and proposals

## Next Steps

This authentication foundation is ready for the following features:

- Lead management (CRUD operations)
- Customer management
- Task management and reminders
- Communication logging (calls, emails, WhatsApp)
- Project and inventory management
- Proposal generation and sharing
- Real-time notifications
- Dashboard and analytics

## Development Notes

- Both frontend and backend use TypeScript
- Backend uses CommonJS modules
- Frontend uses ES modules via Vite
- Database is MongoDB with Mongoose ODM
- Authentication uses JWT tokens
- Real-time features use Socket.io

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running: `mongod`
- Check `.env` file is properly configured
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check `.env.development` file
- Verify CORS is properly configured in backend
- Check browser console for API errors

### Token authentication failing
- Clear localStorage: `localStorage.clear()` in browser console
- Check JWT_SECRET matches between frontend requests and backend validation
- Verify token is being sent in Authorization header

## License

ISC
