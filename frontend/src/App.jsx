// Main App Component: Sets up React Router and navigation
// Manages authentication state globally
// Routes to different pages based on user role and auth status

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user and token from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle login: save token and user info
  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // Handle logout: clear token and user info
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Campus-Events
            </Link>

            <ul className="nav-menu">
              <li>
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="nav-link">
                  Events
                </Link>
              </li>

              {/* Show different links based on auth status and role */}
              {token ? (
                <>
                  {user?.role === 'student' && (
                    <li>
                      <Link to="/my-events" className="nav-link">
                        My Events
                      </Link>
                    </li>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <li>
                        <Link to="/admin" className="nav-link">
                          Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/create-event" className="nav-link">
                          Create Event
                        </Link>
                      </li>
                    </>
                  )}

                  <li className="nav-user-info">
                    <span>{user?.name}</span>
                    <span className="role-badge">{user?.role}</span>
                  </li>

                  <li>
                    <button onClick={handleLogout} className="nav-btn logout-btn">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="nav-btn">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="nav-btn">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>

        {/* Routes */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events token={token} user={user} />} />
            <Route
              path="/event/:id"
              element={<EventDetails token={token} user={user} />}
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route
              path="/my-events"
              element={<MyEvents token={token} user={user} />}
            />
            <Route
              path="/admin"
              element={<AdminDashboard token={token} user={user} />}
            />
            <Route
              path="/create-event"
              element={<CreateEvent token={token} user={user} />}
            />
            <Route
              path="/edit-event/:id"
              element={<EditEvent token={token} user={user} />}
            />
          </Routes>
        </main>

        {/* Footer */}
       
      </div>
    </Router>
  );
}

export default App;
