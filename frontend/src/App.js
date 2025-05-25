import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8888");

function App() {
  const [cash, setCash] = useState(0);

  useEffect(() => {
    socket.on("cashUpdate", (newCash) => {
      setCash(newCash);
    });

    // Clean up on unmount
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
    <div className="container text-center mt-5">
      <h1 className="mb-4">Community Pantry Donation Drive</h1>
      <div className="card mx-auto" style={{ maxWidth: 400 }}>
        <div className="card-body">
          <h2 className="card-title mb-3">
            Total Cash: <span className="badge bg-success">${cash}</span>
          </h2>
          <p className="card-text mb-4">
            Give according to one's capacity;
            <br />
            Take according to one's need.
          </p>
          <div className="d-flex justify-content-between">
            <button className="btn btn-primary btn-lg" onClick={handleDonate}>
              Donate $10
            </button>
            <button className="btn btn-danger btn-lg" onClick={handleRedeem}>
              Redeem $10
            </button>
          </div>
        </div>
      </div>
      <div className="alert alert-warning mt-4" role="alert">
        <b>
          Pushing the blue button updates the cash by 10. The cash should be
          updated on the server and displayed in REAL TIME. Pushing the red
          button deducts the cash by 10.
        </b>
      </div>
    </div>
  );
}

export default App;
