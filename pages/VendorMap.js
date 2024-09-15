"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/firebase';
import { collection, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import ReservationModal from "../components/ReservationModal";
import styled from 'styled-components';
import { useRouter } from 'next/router';

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 60px)" // Adjust height to account for footer
};

const Footer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #0070f3;
  color: white;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.1);
`;

const FooterButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const VendorInfo = styled.div`
  position: fixed;
  bottom: 60px; // Adjust based on footer height
  left: 0;
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ccc;
  box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.1);
`;

export default function VendorMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCHPcRdQg0ZxO0TISUyP9tMCvxupmZvtkc",
  });

  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [user, setUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch vendor profile information
        const userRef = doc(db, "users", currentUser.uid);
        const userProfileSnap = await getDoc(userRef);
        if (userProfileSnap.exists()) {
          setVendorProfile(userProfileSnap.data());
        }
      } else {
        setUser(null);
        setVendorProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleMarkerClick = (stall) => {
    if (!stall.confirmed) {
      setSelectedStall(stall);
    }
  };

  const handleReservationComplete = async (stall) => {
    if (!user) {
      alert("予約を行うにはログインが必要です。");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userProfileSnap = await getDoc(userRef);

    if (!userProfileSnap.exists()) {
      alert("ユーザープロフィール情報が見つかりません。プロフィールを設定してください。");
      return;
    }

    const userProfile = userProfileSnap.data();

    const stallRef = doc(db, "stalls", stall.id);
    await updateDoc(stallRef, {
      confirmed: true,
      reservedBy: user.uid,
      shopName: userProfile.shopName || user.displayName,
      description: userProfile.description || "店舗の紹介文を入力してください。",
      menu: userProfile.menu || [],
    });

    setSelectedStall(null);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={{ lat: 26.2124, lng: 127.6809 }}  // デフォルトの座標（例: 沖縄）
      >
        {stalls.map((stall) => (
          <Marker
            key={stall.id}
            position={{ lat: stall.lat, lng: stall.lng }}
            icon={{
              url: stall.confirmed ? "/red-pin.png" : "/white-pin.png",
              scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null,
            }}
            onClick={() => handleMarkerClick(stall)}
          />
        ))}
      </GoogleMap>

      {selectedStall && (
        <ReservationModal 
          stall={selectedStall} 
          onClose={() => setSelectedStall(null)} 
          onComplete={handleReservationComplete} 
        />
      )}

      {vendorProfile && (
        <VendorInfo>
          <h3>{vendorProfile.storeName}</h3>
          <p>{vendorProfile.storeIntroduction}</p>
        </VendorInfo>
      )}

      <Footer>
        <FooterButton onClick={() => router.push('/profile')}>Profile</FooterButton>
        <FooterButton onClick={() => router.push('/vendormap')}>Map</FooterButton>
      </Footer>
    </div>
  );
}
