import React, { createContext, useContext, useState } from "react";

const StationContext = createContext(null);

export function StationProvider({ children }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null); // { lat, lng }
  return (
    <StationContext.Provider value={{ selectedStation, setSelectedStation, clickedCoords, setClickedCoords }}>
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  return useContext(StationContext);
}