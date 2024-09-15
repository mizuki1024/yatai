"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100vh"
};

export default function OrganizerMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCHPcRdQg0ZxO0TISUyP9tMCvxupmZvtkc",
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [stalls, setStalls] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stalls"), (snapshot) => {
      const stallData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStalls(stallData);
    });

    return () => unsubscribe();
  }, []);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("地図上で出店位置を選択してください");
      return;
    }

    await addDoc(collection(db, "stalls"), {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      confirmed: false,
    });

    setSelectedLocation(null);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="submit">屋台の位置を追加</button>
      </form>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={{ lat: 26.2124, lng: 127.6809 }}  // デフォルトの座標（例: 沖縄）
        onClick={handleMapClick}
      >
        {stalls.map((stall) => (
          <Marker
            key={stall.id}
            position={{ lat: stall.lat, lng: stall.lng }}
            icon={{
              url: stall.confirmed ? "/red-pin.png" : "/white-pin.png",
              scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null,
            }}
          />
        ))}
        {selectedLocation && (
          <Marker position={selectedLocation} />
        )}
      </GoogleMap>
    </div>
  );
}
