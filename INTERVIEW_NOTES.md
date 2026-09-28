# Interview Notes: Campus Event Management System

Short, interviewer-friendly answers for MERN concepts used in this project.

## MERN Stack Overview

**Q: What is MERN?**

A: MERN stands for MongoDB, Express, React, and Node.js. It's a full-stack JavaScript framework.

- **MongoDB**: NoSQL database that stores data as JSON documents
- **Express**: Web server framework that handles HTTP requests
- **React**: Frontend library for building user interfaces
- **Node.js**: JavaScript runtime that runs on servers

All four use JavaScript, so one language handles both frontend and backend.

---

## Architecture & Design

**Q: Explain your project structure.**

A: The project follows the MVC (Model-View-Controller) pattern:

- **Models** (`backend/models/`): MongoDB schemas define database structure (User, Event, EventRegistration)
- **Controllers** (`backend/controllers/`): Business logic processes requests (authController, eventController, registrationController)
- **Routes** (`backend/routes/`): Maps URLs to controller functions (GET /events → getEvents function)
- **Views** (`frontend/src/`): React components render UI
- **Middleware** (`backend/middleware/`): Authentication and authorization

This separation makes code testable, maintainable, and scalable.

---

## REST API Fundamentals

**Q: What is REST API?**

A: REST (Representational State Transfer) is a way to design web APIs using HTTP methods:

- **GET**: Retrieve data (doesn't change anything)
- **POST**: Create new data
- **PUT**: Update existing data
- **DELETE**: Remove data

Example:
```
GET /api/events              # Get all events
GET /api/events/123          # Get one event
POST /api/events             # Create new event
PUT /api/events/123          # Update event
DELETE /api/events/123       # Delete event
```

**Q: What are HTTP status codes?**

A: Numbers that indicate the result of a request:

```
2xx - Success (200 OK, 201 Created)
3xx - Redirect (301 Moved)
4xx - Client Error (400 Bad Request, 401 Unauthorized, 404 Not Found)
5xx - Server Error (500 Internal Server Error, 503 Service Unavailable)
```

In our app:
- `200` = Successful GET/PUT/DELETE
- `201` = Successful POST (resource created)
- `400` = Invalid input or business logic error
- `401` = Missing/invalid JWT token
- `403` = Insufficient permissions
- `404` = Resource not found
- `500` = Unexpected server error

---

## Authentication & Authorization

**Q: What's the difference between authentication and authorization?**

A: Two different security concepts:

**Authentication**: "Who are you?"
- Verify user's identity (login with email/password)
- Server creates JWT token to prove identity
- Token sent in every request

**Authorization**: "What can you do?"
- Check if authenticated user has permission for action
- Example: Only admins can create events
- Example: Only event creator can edit their event

In code:
```javascript
// Authentication middleware - verifies token exists
router.post('/events', authenticate, createEvent);

// Authorization middleware - checks user role
router.post('/events', authenticate, isAdmin, createEvent);
```

---

## JWT (JSON Web Tokens)

**Q: How does JWT authentication work?**

A: Three-step process:

**Step 1: Login**
```
User: { email: "user@example.com", password: "secret" }
Server: Validates password, creates JWT token
Client: Receives token, stores in localStorage
```

**Step 2: Sending Token**
```
Client: GET /api/events
        Header: Authorization: Bearer eyJhbGc...
Server: Extracts token from header
```

**Step 3: Verification**
```
Server: Verifies token signature using JWT_SECRET
        Checks expiry time (1 hour in our app)
        If valid: req.user = { id, role }
        If invalid: Return 401 Unauthorized
```

**Q: What's inside a JWT token?**

A: JWT has three parts separated by dots:

```
Header.Payload.Signature

Header: { alg: "HS256", typ: "JWT" }
Payload: { id: "user123", role: "admin", iat: 1234, exp: 1238 }
Signature: HMACSHA256(Header.Payload, JWT_SECRET)
```

The signature ensures the token wasn't tampered with. If someone changes the payload, the signature becomes invalid.

**Q: Why use JWT instead of cookies?**

A: JWT advantages:
- Stateless: Server doesn't need to store session data
- Works across domains: Good for mobile apps and APIs
- Secure: Signature prevents tampering
- Mobile-friendly: No browser cookies required
- Scalable: No session storage on server

---

## Input Validation & Security

**Q: Why validate input on the server?**

A: Never trust client input. Validation prevents:

1. **Invalid Data**: Wrong data types, empty fields
2. **Security Attacks**: SQL injection (doesn't apply to MongoDB, but still validate)
3. **Business Logic Errors**: Duplicate registrations, capacity overflow
4. **Bad User Experience**: Prevent invalid operations

Example:
```javascript
// Validate email format
if (!email.match(/^[\w-\.]+@[\w-\.]+\.\w+$/)) {
  return res.status(400).json({ message: 'Invalid email' });
}

// Validate capacity
if (capacity < 1) {
  return res.status(400).json({ message: 'Capacity must be at least 1' });
}
```

**Q: How do you prevent duplicate event registrations?**

A: MongoDB unique compound index:

```javascript
// In EventRegistration schema
eventRegistrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

// Prevents: Same student registering for same event twice
// Error: E11000 duplicate key error
```

Also validate in controller:
```javascript
const existingRegistration = await EventRegistration.findOne({
  studentId,
  eventId,
});

if (existingRegistration) {
  return res.status(400).json({ message: 'Already registered' });
}
```

---

## Bcrypt Password Hashing

**Q: Why hash passwords?**

A: Never store plain passwords. If database is breached, hackers see hashes, not passwords.

**Q: How does bcrypt work?**

A: One-way encryption:

```javascript
// Registration
const plainPassword = 'mypassword123';
const hash = await bcrypt.hash(plainPassword, 10); // 10 = salt rounds
// hash = "$2b$10$..." (different every time, but validates correctly)

// Login
const isValid = await bcrypt.compare(plainPassword, hash);
// Returns true/false without revealing original password
```

Salt rounds: Higher = slower but more secure. 10 is standard balance.

---

## MongoDB & Mongoose

**Q: What is MongoDB?**

A: NoSQL database that stores data as JSON-like documents (BSON).

Unlike SQL (tables with rows), MongoDB stores flexible documents:
```javascript
// SQL approach
Table: users
Rows: { id, name, email, password, role }

// MongoDB approach
Collection: users
Documents: { _id, name, email, password, role, createdAt, updatedAt }
```

**Q: What are Mongoose models?**

A: Schemas that define structure and validation:

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, select: false }, // Not included by default
});

const User = mongoose.model('User', userSchema);
```

**Q: How does `populate()` work?**

A: Joins related documents (like SQL JOIN):

```javascript
// EventRegistration has eventId reference
const registrations = await EventRegistration.find()
  .populate('eventId'); // Replaces eventId with full event document

// Before: { studentId: "123", eventId: "456" }
// After: { studentId: "123", eventId: { _id: "456", title: "..." } }
```

**Q: What are indexes?**

A: Fast lookup keys for common queries:

```javascript
// Unique index prevents duplicates
userSchema.index({ email: 1 }, { unique: true });

// Compound index for pagination
eventRegistrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

// Without index, MongoDB scans every document (slow)
// With index, MongoDB finds data instantly
```

---

## Pagination

**Q: Why implement pagination?**

A: Databases can have millions of records. Pagination:
- Improves performance: Load 6 items, not 1 million
- Saves bandwidth: Send less data over network
- Better UX: Users see organized pages

**Q: How does skip() and limit() work?**

A: Simple math:

```javascript
const page = 2;
const limit = 6;
const skip = (page - 1) * limit; // (2-1)*6 = 6

// Skip first 6 items, get next 6
const items = await Item.find()
  .skip(6)      // Skip items 0-5
  .limit(6);    // Get items 6-11 (page 2)
```

Page 1: skip=0, items 0-5
Page 2: skip=6, items 6-11
Page 3: skip=12, items 12-17

**Q: How do you paginate with search/filters?**

A: Apply filters BEFORE skip/limit:

```javascript
// Pagination with search AND filter
const filter = {};
if (search) filter.title = { $regex: search };
if (category) filter.category = category;

const items = await Item.find(filter)
  .skip((page - 1) * limit)
  .limit(limit);

// Also count total matching items
const total = await Item.countDocuments(filter);
const totalPages = Math.ceil(total / limit);
```

---

## Error Handling

**Q: What's a global error handler?**

A: Middleware that catches all errors:

```javascript
// Must be last middleware, with 4 parameters
app.use((err, req, res, next) => {
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({ message: 'Database unavailable' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID' });
  }
  res.status(500).json({ message: 'Server error' });
});
```

Benefits:
- One place to handle all errors
- Consistent error responses
- Never exposes stack traces to users
- Catches unexpected errors

**Q: How do you handle async errors?**

A: Use try/catch blocks:

```javascript
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

---

## React & Frontend

**Q: How does React Router work?**

A: Maps URLs to components:

```javascript
<Routes>
  <Route path="/events" element={<Events />} />
  <Route path="/event/:id" element={<EventDetails />} />
</Routes>

// URL: http://localhost:3000/events → <Events /> renders
// URL: http://localhost:3000/event/123 → <EventDetails /> renders
```

**Q: How do you store JWT in browser?**

A: localStorage (for learning projects):

```javascript
// Save after login
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Retrieve on page load
const token = localStorage.getItem('token');

// Send in requests
fetch('/api/events', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Note**: localStorage is NOT secure for production (XSS attacks). Production uses httpOnly cookies.

**Q: How do you manage state in React?**

A: Simple approach: useState hook:

```javascript
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// State changes trigger re-render
setLoading(true);
setEvents(newEvents);
setError('');
```

For large apps, use Redux. This project keeps it simple with useState.

**Q: How do you fetch data in React?**

A: useEffect hook:

```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  fetchData();
}, [page, search]); // Re-run when page or search changes
```

---

## Common Interview Questions

**Q: Tell me about this project.**

A: I built a campus event management system using MERN stack. Students can view events, search, filter by category, and register. Admins can create, edit, and delete events. The backend uses Express and MongoDB with JWT authentication. Frontend is React with routing. Features include pagination, validation, and role-based access control.

**Q: What challenges did you face?**

A: 
- Implementing pagination with search/filters required careful query building
- Preventing duplicate registrations needed MongoDB unique indexes
- Managing JWT token storage and expiry
- Handling async operations and error cases
- CORS issues between frontend and backend (resolved with cors middleware)

**Q: What would you improve?**

A:
- Use TypeScript for type safety
- Add unit tests with Jest
- Implement password reset via email
- Add email verification for registration
- Use Redux for complex state management
- Deploy to production with proper security
- Add real-time notifications with Socket.io
- Implement image uploads for events

**Q: Explain your authentication flow.**

A: User registers with email/password. Server hashes password with bcrypt (10 rounds). On login, server verifies password and creates JWT token. Client stores token in localStorage. For protected routes, client sends token in Authorization header. Backend middleware verifies token signature and expiry. If valid, user ID and role are extracted. Authorization middleware checks role for admin-only routes.

**Q: How do you prevent unauthorized access?**

A:
1. Validate token exists
2. Verify JWT signature
3. Check token expiry
4. Verify user role for restricted routes
5. Verify user owns resource (e.g., admin can only edit own events)
6. Return 401/403 errors appropriately

**Q: How does pagination work?**

A: Backend calculates skip = (page - 1) * limit. Query skips first `skip` documents and returns `limit` documents. Also count total matching documents to calculate totalPages. Frontend sends page number in query string and displays page buttons. Clicking button updates page state, which re-fetches data with new page number.

---

## Key Concepts to Understand

1. **Stateless Auth**: JWT doesn't require server to store sessions
2. **Separation of Concerns**: Models, controllers, routes are separate
3. **Middleware Pattern**: Functions intercept and process requests
4. **Promise-based**: JavaScript async/await handles asynchronous operations
5. **Component Composition**: React breaks UI into reusable pieces
6. **Unidirectional Data Flow**: Props down, events up in React

---

## Remember for Interviews

✅ Know the technology stack (MERN)
✅ Understand authentication vs authorization
✅ Explain JWT token flow
✅ Know how pagination works
✅ Understand MVC architecture
✅ Know REST API principles
✅ Explain error handling strategy
✅ Be ready to discuss security
✅ Know Mongoose basics
✅ Explain React hooks (useState, useEffect)
