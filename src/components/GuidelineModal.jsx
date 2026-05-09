import React from "react";

const GuidelineModal = ({ visible, onClose, message }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        width: "300px",
        textAlign: "center"
      }}>
        <p>{message}</p>
        <button
          onClick={onClose}
          style={{ marginTop: "10px", padding: "5px 10px" }}
        >
          Tamam
        </button>
      </div>
    </div>
  );
};

export default GuidelineModal;