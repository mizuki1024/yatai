"use client"; // これを追加して、コンポーネントがクライアントで実行されることを示します

import React, { useState, useCallback, useEffect } from "react";
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import ReservationModal from "./ReservationModal";  // モーダルコンポーネントをインポート
import Link from 'next/link';

const mapContainerStyle = {
  width: "100%",
  height: "50vh", // 地図の高さを設定
};

const center = {
  lat: 26.2124, // 初期の中心座標 (例: 沖縄)
  lng: 127.6809,
};

export default function AddStallForm() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCHPcRdQg0ZxO0TISUyP9tMCvxupmZvtkc", // 自分のAPIキーに置き換えてください
  });

  const [name, setName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null); // 選択された位置を管理
  const [stalls, setStalls] = useState([]); // Firestoreから取得した屋台の位置を保存
  const [selectedStall, setSelectedStall] = useState(null); // モーダルで表示するための選択された屋台

  // Firestoreからリアルタイムでデータを取得
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stalls"), (snapshot) => {
      const stallData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStalls(stallData);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
  }, []);

  const handleMarkerClick = (stall) => {
    if (!stall.confirmed) { // confirmed が false の場合のみ予約モーダルを表示
      setSelectedStall(stall);
    }
  };

  const handleReservationComplete = async (stall) => {
    const stallRef = doc(db, "stalls", stall.id);
    await updateDoc(stallRef, {
      confirmed: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("地図上で出店位置を選択してください");
      return;
    }

    await addDoc(collection(db, "stalls"), {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      name,
      confirmed: false,
    });

    setSelectedLocation(null);
    setName("");
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="出店名"
        />
        <button type="submit">追加</button>
      </form>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        onClick={handleMapClick} // 地図クリックイベントハンドラを設定
      >
        {stalls.map((stall) => (
          <Marker
            key={stall.id}
            position={{ lat: stall.lat, lng: stall.lng }}
            icon={{
              url: stall.confirmed ? "/red-pin.png" : "/white-pin.png",
              scaledSize: new window.google.maps.Size(40, 40), // ピンのサイズを調整
            }}
            onClick={() => handleMarkerClick(stall)} // ピンをクリックした際の処理
          />
        ))}
        {selectedLocation && (
          <Marker
            position={selectedLocation} // 選択された位置にピンを表示
          />
        )}
      </GoogleMap>

      {/* 予約モーダルの表示 */}
      {selectedStall && (
        <ReservationModal 
          stall={selectedStall} 
          onClose={() => setSelectedStall(null)} 
          onComplete={handleReservationComplete} 
        />
      )}

      {/* 固定下部ナビゲーションバー */}
      <footer className="app-footer">
        <div className="nav-bar">
          <Link href="/">
            Home
          </Link>
          <Link href="/orders">
            Orders
          </Link>
          <Link href="/promotions">
            Promotions
          </Link>
          <Link href="/account">
            Account
          </Link>
        </div>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto; /* スクロール可能にする */
        }

        .form {
          padding: 16px;
        }

        .app-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          background-color: #f8f8f8;
          padding: 10px 0;
          border-top: 1px solid #ddd;
        }

        .nav-bar {
          display: flex; /* 横並びにする */
          justify-content: space-around; /* アイテムを等間隔に配置 */
          width: 100%;
        }

        .nav-bar a {
          color: #333;
          text-decoration: none;
          padding: 10px;
          font-size: 16px;
          text-align: center;
          flex: 1; /* 各リンクを均等に広げる */
        }

        .nav-bar a.active {
          font-weight: bold;
          color: #000;
        }
      `}</style>
    </div>
  );
}
