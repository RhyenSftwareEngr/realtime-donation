import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth0 } from "@auth0/auth0-react";
import "./modern.css"; // Custom modern styles

// Connect to backend Socket.IO server
const socket = io("http://localhost:8888");
const GOAL = 100;

function App() {
  const [cash, setCash] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const prevCash = useRef(0);
  const animatedCash = useRef(cash);

  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } =
    useAuth0();

  // Animate cash value
  useEffect(() => {
    let frame;
    const animate = () => {
      if (animatedCash.current !== cash) {
        animatedCash.current += (cash - animatedCash.current) * 0.2;
        if (Math.abs(animatedCash.current - cash) < 1) {
          animatedCash.current = cash;
        } else {
          frame = requestAnimationFrame(animate);
        }
        setCashDisplay(Math.round(animatedCash.current));
      }
    };
    animate();
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [cash]);

  const [cashDisplay, setCashDisplay] = useState(cash);

  // Listen for real-time cash updates
  useEffect(() => {
    socket.on("cashUpdate", (newCash) => {
      // Show toast if value changed
      if (prevCash.current !== 0) {
        if (newCash > prevCash.current) {
          setToastMsg("Thank you for donating ₱10!");
        } else if (newCash < prevCash.current) {
          setToastMsg("You redeemed ₱10!");
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
      prevCash.current = newCash;
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

  if (isLoading)
    return (
      <div className="modern-bg min-vh-100 d-flex align-items-center justify-content-center">
        <div>Loading...</div>
      </div>
    );

  return (
    <div className="modern-bg min-vh-100 d-flex flex-column justify-content-center align-items-center">
      {/* Toast Notification */}
      <div
        className={`toast align-items-center text-white bg-primary border-0 position-fixed top-0 end-0 m-4 ${
          showToast ? "show" : ""
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{ zIndex: 9999, minWidth: 200 }}
      >
        <div className="d-flex">
          <div className="toast-body">{toastMsg}</div>
        </div>
      </div>

      {/* Auth0 Login/Logout and User Info */}
      <div className="mb-3 text-center w-100">
        {!isAuthenticated ? (
          <button
            className="btn btn-outline-primary btn-modern"
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
              width={48}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            />
            <span className="ms-2 fw-semibold" style={{ fontSize: "1.2rem" }}>
              {user.name}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm ms-3 btn-modern"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 text-center">
        <h1
          className="fw-bold text-primary mb-2"
          style={{ fontSize: "2.7rem", letterSpacing: "-1px" }}
        >
          <i className="bi bi-people-fill me-2"></i>
          Community Pantry Donation Drive
        </h1>
        <p className="lead text-secondary" style={{ fontWeight: 500 }}>
          Give according to one's capacity;
          <br />
          Take according to one's need.
        </p>
      </div>

      {/* Only show donation UI if authenticated */}
      {isAuthenticated && (
        <div
          className="modern-card card shadow-lg rounded-4 p-4"
          style={{ maxWidth: 420, width: "100%", border: "none" }}
        >
          <div className="card-body text-center p-0">
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="progress modern-progress"
                style={{ height: "24px", background: "rgba(0,0,0,0.07)" }}
              >
                <div
                  className={`progress-bar ${
                    cash >= GOAL ? "bg-success" : "modern-gradient"
                  }`}
                  role="progressbar"
                  style={{ width: `${Math.min((cash / GOAL) * 100, 100)}%` }}
                  aria-valuenow={cash}
                  aria-valuemin={0}
                  aria-valuemax={GOAL}
                >
                  {cash >= GOAL
                    ? "Goal Reached!"
                    : `₱${cashDisplay} of ₱${GOAL}`}
                </div>
              </div>
              <small className="text-muted">Goal: ₱{GOAL}</small>
            </div>
            {/* Cash Display */}
            <h2 className="display-5 mb-4">
              <span
                className="badge bg-success p-3"
                style={{
                  fontSize: "2.2rem",
                  background: "linear-gradient(90deg,#43cea2,#185a9d)",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(67,206,162,0.15)",
                }}
              >
                <i className="bi bi-cash-coin me-2"></i>₱{cashDisplay}
              </span>
            </h2>
            {/* Buttons */}
            <div className="d-flex justify-content-between gap-3 mb-4">
              <button
                className="btn btn-primary btn-lg flex-fill btn-modern"
                onClick={handleDonate}
                style={{ fontWeight: 600 }}
              >
                <i className="bi bi-plus-circle me-2"></i>Donate ₱10
              </button>
              <button
                className="btn btn-danger btn-lg flex-fill btn-modern"
                onClick={handleRedeem}
                disabled={cash < 10}
                style={{ fontWeight: 600 }}
              >
                <i className="bi bi-dash-circle me-2"></i>Redeem ₱10
              </button>
            </div>
            <div
              className="alert alert-warning mt-3 mb-0"
              role="alert"
              style={{ fontWeight: 500 }}
            >
              <b>
                All changes are updated in{" "}
                <span className="text-danger">REAL TIME</span> for every user!
              </b>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-5 text-muted small">
        {isAuthenticated && user && (
          <div className="mb-2">Welcome, {user.given_name || user.name}!</div>
        )}
        &copy; {new Date().getFullYear()} Community Pantry PH &middot;{" "}
        <a
          href="https://github.com/your-repo"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
