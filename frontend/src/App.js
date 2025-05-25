import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth0 } from "@auth0/auth0-react";

// Connect to backend Socket.IO server
const socket = io("http://localhost:8888");
const GOAL = 100;

function App() {
  // State for cash value
  const [cash, setCash] = useState(0);
  // Auth0 hooks
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } =
    useAuth0();

  // Listen for real-time cash updates
  useEffect(() => {
    socket.on("cashUpdate", (newCash) => {
      setCash(newCash);
    });
    return () => {
      socket.off("cashUpdate");
    };
  }, []);

  // Emit donate event
  const handleDonate = () => {
    socket.emit("donate");
  };

  // Emit redeem event
  const handleRedeem = () => {
    socket.emit("redeem");
  };

  // Show loading state while Auth0 is initializing
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
      {/* Auth0 Login/Logout and User Info */}
      <div className="mb-3 text-center w-100">
        {!isAuthenticated ? (
          <button
            className="btn btn-outline-primary"
            onClick={() => loginWithRedirect()}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>Log In / Sign Up
          </button>
        ) : (
          <div>
            <img
              src={user.picture}
              alt="avatar"
              className="rounded-circle"
              width={40}
            />
            <span className="ms-2">{user.name}</span>
            <button
              className="btn btn-outline-secondary btn-sm ms-3"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        )}
      </div>
      <div className="mb-4 text-center">
        <h1 className="fw-bold text-primary mb-2">
          <i className="bi bi-people-fill me-2"></i>
          Community Pantry Donation Drive
        </h1>
        <p className="lead text-secondary">
          Give according to one's capacity;
          <br />
          Take according to one's need.
        </p>
      </div>
      {/* Only show donation UI if authenticated */}
      {isAuthenticated && (
        <div
          className="card shadow-lg"
          style={{ maxWidth: 400, width: "100%" }}
        >
          <div className="card-body text-center">
            {/* ADD PROGRESS BAR HERE */}
            <div className="mb-3">
              <div className="progress" style={{ height: "24px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${Math.min((cash / GOAL) * 100, 100)}%` }}
                  aria-valuenow={cash}
                  aria-valuemin={0}
                  aria-valuemax={GOAL}
                >
                  {cash >= GOAL
                    ? "Goal Reached!"
                    : `${Math.min((cash / GOAL) * 100, 100).toFixed(0)}%`}
                </div>
              </div>
              <small className="text-muted">Goal: ${GOAL}</small>
            </div>
            <h2 className="display-5 mb-3">
              <span className="badge bg-success p-3">
                <i className="bi bi-cash-coin me-2"></i>Pesos{cash}
              </span>
            </h2>
            <div className="d-flex justify-content-between gap-3 mb-3">
              <button
                className="btn btn-primary btn-lg flex-fill"
                onClick={handleDonate}
              >
                <i className="bi bi-plus-circle me-2"></i>Donate 10 Pesos
              </button>
              <button
                className="btn btn-danger btn-lg flex-fill"
                onClick={handleRedeem}
              >
                <i className="bi bi-dash-circle me-2"></i>Redeem 10 Pesos
              </button>
            </div>
            <div className="alert alert-warning mt-3 mb-0" role="alert">
              <b>
                All changes are updated in{" "}
                <span className="text-danger">REAL TIME</span> for every user!
              </b>
            </div>
          </div>
        </div>
      )}
      <footer className="mt-5 text-muted small">
        &copy; {new Date().getFullYear()} Community Pantry PH
      </footer>
    </div>
  );
}

export default App;
