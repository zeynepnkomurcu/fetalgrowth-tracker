import React from "react";

const DopplerInput = ({ visible }) => {
  if (!visible) return null; // visible false ise hiçbir şey gösterme

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
      <h3>Doppler Measurements</h3>
      <label>
        UA PI:
        <input type="number" />
      </label>
      <label>
        MCA PI:
        <input type="number" />
      </label>
      <label>
        DV PIV:
        <input type="number" />
      </label>
      <div>
        End-Diastolic Flow:
        <button>Normal</button>
        <button>Absent (AEDF)</button>
        <button>Reversed (REDF)</button>
      </div>
    </div>
  );
};

export default DopplerInput;