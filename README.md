# Campus Event Management System

A simple, beginner-friendly MERN (MongoDB, Express.js, React + Vite, Node.js) application for managing campus events. Students can view, search, and register for events. Admins can create, update, and delete events.

## Features

- **Student/Admin Registration & Login**: Create account and authenticate with JWT
- **JWT Authentication**: Token-based auth with 1-hour expiry
- **Role-Based Access Control**: Students view/register; Admins create/manage events
- **Event Management**: Create, edit, delete events with category filtering
- **Event Registration**: Register/cancel registrations and view personal event list
- **Search & Filter**: Search by title/description, filter by category
- **Pagination**: Backend pagination with Previous/Next/page numbers
- **Event Categories**: Technology, Workshop, Sports, Cultural
- **Event Capacity Management**: Track registrations against max capacity

## Project Structure

```
campus-event-management-system/
├── backend/
│   ├── models/              # MongoDB Schemas (User, Event, EventRegistration)
│   ├── routes/              # API Routes
│   ├── controllers/         # Business Logic
│   ├── middleware/          # Auth & Authorization
│   ├── server.js            # Express App Setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable Components
│   │   ├── pages/           # Page Components
│   │   ├── App.jsx          # Main App with Routing
│   │   ├── App.css          # Global Styles
│   │   └── main.jsx         # React Entry Point
│   ├── index.html           # HTML Template
│   ├── vite.config.js       # Vite Configuration
│   └── package.json
├── .env.example             # Environment Variables Template
├── .gitignore               # Git Ignore Rules
└── README.md
```

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas cloud)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone/Extract the Project

```bash
unzip campus-event-management.zip
cd campus-event-management-system
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp ../.env.example .env

# Edit .env and add your MongoDB URI and JWT Secret
# Example:
# MONGODB_URI=mongodb://localhost:27017/campus-events
# JWT_SECRET=your-super-secret-key-min-32-chars

# Start MongoDB (if running locally)
# On macOS with Homebrew: brew services start mongodb-community
# On Linux: sudo systemctl start mongod
# Or use MongoDB Atlas (cloud): Add connection string to .env

# Run backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Setup Frontend

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Create Demo Accounts (Optional)

The system includes demo credentials for testing:

- **Student**: student@example.com / password
- **Admin**: admin@example.com / password

Or register new accounts through the registration page.

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Verify connection
mongosh
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
4. Add to `.env` file as `MONGODB_URI`

## API Endpoints

### Authentication

```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
```

### Events (Public)

```
GET    /api/events             - Get all events (with search/filter/pagination)
GET    /api/events/:id         - Get single event details
```

### Events (Admin Only)

```
POST   /api/events             - Create event
PUT    /api/events/:id         - Update event
DELETE /api/events/:id         - Delete event
```

### Registrations (Protected)

```
POST   /api/registrations      - Register for event
DELETE /api/registrations/:id  - Cancel registration
GET    /api/registrations/my-events     - Get student's registered events
GET    /api/registrations/check/:id     - Check registration status
```

## API Query Parameters

### Events Pagination & Filtering

```
GET /api/events?page=1&limit=6&search=python&category=Technology

Parameters:
- page: Page number (default: 1)
- limit: Events per page (default: 6)
- search: Search in title/description (optional)
- category: Filter by category (Technology/Workshop/Sports/Cultural)
```

## How JWT Authentication Works

1. **Registration/Login**: User sends credentials → Server validates → Server creates JWT token
2. **Token Structure**: JWT contains user ID and role, expires in 1 hour
3. **Protected Routes**: Client sends token in `Authorization: Bearer <token>` header
4. **Verification**: Middleware verifies token signature and expiry
5. **Storage**: Token stored in localStorage (learning project)

```javascript
// Example: Sending token in requests
const response = await fetch('/api/events', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## How Pagination Works

### Backend Implementation

```javascript
// Example: Skip first 6 items, get next 6
const skip = (page - 1) * limit;  // page=2, limit=6 → skip=6
const events = await Event.find({})
  .skip(skip)
  .limit(limit);
```

### Frontend Handling

```javascript
// Fetch with pagination parameters
const url = `/api/events?page=${currentPage}&limit=6`;
const response = await fetch(url);
const { data, pagination } = await response.json();
// pagination: { currentPage, totalPages, totalEvents, limit }
```

## How Validation Works

### Backend Validation (Input Sanitization)

1. **Required Fields**: Check if fields exist
2. **Type Validation**: Ensure correct data types
3. **Length Validation**: Check min/max string lengths
4. **Format Validation**: Validate email, date formats
5. **Business Logic**: Check duplicates, capacity limits

### Error Responses

```json
{
  "message": "Email already registered",
  "status": 400
}
```

## How Error Handling Works

### Global Error Handler

```javascript
// Express middleware catches all errors
app.use((err, req, res, next) => {
  if (err.name === 'MongoNetworkError') {
    res.status(503).json({ message: 'Database unavailable' });
  }
});
```

### Specific Error Scenarios

| Scenario | Status | Message |
|----------|--------|---------|
| Missing token | 401 | No token provided |
| Expired token | 401 | Token expired |
| Invalid token | 401 | Invalid token |
| Admin action by student | 403 | Access denied: Admin role required |
| Event not found | 404 | Event not found |
| Invalid ObjectId | 400 | Invalid event ID format |
| Duplicate registration | 400 | You are already registered |
| Event at capacity | 400 | Event is at full capacity |

## HTTP Status Codes Used

- **200**: Successful request (GET, PUT, DELETE)
- **201**: Resource created (POST)
- **400**: Invalid input or business logic error
- **401**: Authentication required or token invalid/expired
- **403**: Insufficient permissions (role not authorized)
- **404**: Resource not found
- **500**: Server error
- **503**: Service unavailable (database down)

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: HS256 algorithm, 1-hour expiry
3. **Protected Routes**: Middleware validates token before access
4. **Role-Based Access**: Only admins can create/edit/delete events
5. **Input Validation**: Server-side validation prevents bad data
6. **Unique Constraints**: MongoDB indexes prevent duplicates
7. **Error Safety**: Never expose passwords or stack traces

## Beginner-Friendly Code

- **Simple Comments**: Every file has clear explanations
- **No Advanced Patterns**: Straightforward async/await, no Redux
- **ES6 Basics**: Uses destructuring, arrow functions, template literals
- **Clear Variable Names**: Easy to understand intent
- **Separated Concerns**: Models, Controllers, Routes are distinct
- **Error Handling**: Try/catch blocks with user-friendly messages

## Common Issues & Solutions

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Ensure MongoDB is running: brew services start mongodb-community
2. Or use MongoDB Atlas and update MONGODB_URI in .env
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy

Solution:
Backend already has CORS enabled. Ensure:
- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:5000
- Check both are running
```

### JWT Token Expired

```
Error: Token expired

Solution:
User needs to login again. Token expires after 1 hour.
```

### Events Not Showing

```
Solution:
1. Ensure MongoDB is running
2. Check .env MONGODB_URI is correct
3. Try creating a new event as admin
```

## Testing Demo Workflow

1. **Register**: Create student account at `/register`
2. **Login**: Login with credentials at `/login`
3. **Browse**: Visit `/events` to see all events
4. **Search**: Use search bar to find events
5. **Filter**: Select category to filter events
6. **Register**: Click event card and register
7. **My Events**: Visit `/my-events` to see registrations
8. **Admin**: Register as admin and visit `/admin` to create events

## Password Requirements

- Minimum 6 characters
- Example: "password", "Student@2024"

## Deployment Notes

For production deployment:

1. **Change JWT Secret**: Use a long random string in `.env`
2. **Use MongoDB Atlas**: Cloud database instead of local
3. **Enable HTTPS**: For secure token transmission
4. **Set NODE_ENV=production**: In backend .env
5. **Build Frontend**: Run `npm run build` to create optimized dist/
6. **Use Process Manager**: pm2 or similar for backend
7. **Environment Variables**: Never commit .env to git

## File Organization Explanation

| Folder | Purpose |
|--------|---------|
| `models/` | Mongoose schemas define database structure |
| `controllers/` | Business logic for handling requests |
| `routes/` | Maps URLs to controller functions |
| `middleware/` | Auth validation and authorization |
| `pages/` | React components for full pages |
| `components/` | Reusable React components |

## Learning Resources

- **JWT**: [JWT.io](https://jwt.io/) - Understand token structure
- **MongoDB**: [MongoDB Docs](https://docs.mongodb.com/) - Database queries
- **Express**: [Express Guide](https://expressjs.com/en/guide/routing.html)
- **React Router**: [React Router Docs](https://reactrouter.com/)
- **Vite**: [Vite Guide](https://vitejs.dev/guide/)

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Cannot Find Module

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Vite Build Issues

```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

## Next Steps for Learning

1. Add email verification for registration
2. Add password reset functionality
3. Add event reviews and ratings
4. Add PDF export for event confirmations
5. Add real-time notifications with Socket.io
6. Add event image uploads
7. Deploy to Heroku/Vercel/Netlify
8. Add TypeScript for type safety
9. Add unit tests with Jest
10. Implement role-based dashboards

## License

This project is open source for educational purposes.

## Support

For issues or questions:
1. Check the error message in browser console
2. Review error handling section above
3. Ensure all prerequisites are installed
4. Check MongoDB connection in .env
5. Verify both frontend and backend are running
