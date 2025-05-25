import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const socket = io("http://localhost:8888");

function App() {
  const [cash, setCash] = useState(0);

  useEffect(() => {
    socket.on("cashUpdate", (newCash) => {
      setCash(newCash);
    });

    return () => {
      socket.off("cashUpdate");
    };
  }, []);

  const handleDonate = () => {
    socket.emit("donate");
  };

  const handleRedeem = () => {
    socket.emit("redeem");
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
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
      <div className="card shadow-lg" style={{ maxWidth: 400, width: "100%" }}>
        <div className="card-body text-center">
          <h2 className="display-5 mb-3">
            <span className="badge bg-success p-3">
              <i className="bi bi-cash-coin me-2"></i>${cash}
            </span>
          </h2>
          <div className="d-flex justify-content-between gap-3 mb-3">
            <button
              className="btn btn-primary btn-lg flex-fill"
              onClick={handleDonate}
            >
              <i className="bi bi-plus-circle me-2"></i>Donate $10
            </button>
            <button
              className="btn btn-danger btn-lg flex-fill"
              onClick={handleRedeem}
            >
              <i className="bi bi-dash-circle me-2"></i>Redeem $10
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
      <footer className="mt-5 text-muted small">
        &copy; {new Date().getFullYear()} Community Pantry PH
      </footer>
    </div>
  );
}

export default App;
