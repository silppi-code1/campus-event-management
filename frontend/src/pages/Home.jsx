// Home Page: Landing page with overview of the system

function Home() {
  return (
    <div className="page-heading">
      <h1>Welcome to Campus Event Management</h1>
      <p>Discover, register, and manage campus events all in one place!</p>

      <div
        style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '3rem auto',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3>Browse Events</h3>
          <p>Find and explore all upcoming campus events</p>
        </div>

        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3>Register Easily</h3>
          <p>Sign up for events with just one click</p>
        </div>

        <div
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3>Manage Events</h3>
          <p>Admins can create and manage events easily</p>
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, #266ca9)',
          color: 'white',
          padding: '2rem',
          borderRadius: '4px',
          marginTop: '3rem',
          maxWidth: '800px',
          margin: '3rem auto',
          textAlign: 'center',
        }}
      >
        <h2>Get Started Today!</h2>
        <p style={{ marginTop: '1rem' }}>
          Register as a student or admin to access all features.
        </p>
      </div>
    </div>
  );
}

export default Home;
