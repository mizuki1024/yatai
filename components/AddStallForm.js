"use client";  // これを最初に追加

import React, { useState, useCallback, useEffect } from "react";
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import ReservationModal from "./ReservationModal";  
import Link from 'next/link';

// 地図のスタイルを定義
const mapContainerStyle = {
  width: "100%",
  height: "100vh"
};

export default function AddStallForm() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCHPcRdQg0ZxO0TISUyP9tMCvxupmZvtkc", // 自分のAPIキーに置き換えてください
  });

  const [name, setName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [user, setUser] = useState(null);
  const [review, setReview] = useState("");
  const [currentPosition, setCurrentPosition] = useState(null); // 現在地を保存

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 現在地を取得して設定
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
          setCurrentPosition({ lat: 26.2124, lng: 127.6809 }); // デフォルトの座標（例: 沖縄）
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setCurrentPosition({ lat: 26.2124, lng: 127.6809 }); // デフォルトの座標
    }
  }, []);

  const fetchStalls = useCallback(() => {
    const unsubscribe = onSnapshot(collection(db, "stalls"), (snapshot) => {
      const stallData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStalls(stallData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchStalls();
  }, [fetchStalls]);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
  }, []);

  const handleMarkerClick = (stall) => {
    if (!stall.confirmed) {
      setSelectedStall(stall);
    } else {
      setSelectedReservation(stall);
    }
  };

  const handleReservationComplete = async (stall) => {
    if (!user) {
      alert("予約を行うにはログインが必要です。");
      return;
    }
  
    // Firestoreからユーザーのプロフィール情報を取得
    const userRef = doc(db, "users", user.uid);
    const userProfileSnap = await getDoc(userRef);
  
    if (!userProfileSnap.exists()) {
      alert("ユーザープロフィール情報が見つかりません。プロフィールを設定してください。");
      return;
    }
  
    const userProfile = userProfileSnap.data();
  
    // 予約情報にユーザープロフィール情報を反映してFirestoreに保存
    const stallRef = doc(db, "stalls", stall.id);
    await updateDoc(stallRef, {
      confirmed: true,
      reservedBy: user.uid,
      shopName: userProfile.shopName || user.displayName,  // プロフィール情報から店舗名を取得
      description: userProfile.description || "店舗の紹介文を入力してください。",
      menu: userProfile.menu || [],  // プロフィール情報にメニューがあれば反映
      reviews: []  // 初期レビューは空で設定
    });
  
    fetchStalls(); // 予約完了後にデータを再取得
    setSelectedStall(null); // モーダルを閉じる
  };
  
  const handleReviewSubmit = async () => {
    if (!user || !selectedReservation) {
      alert("レビューを投稿するにはログインしている必要があります。");
      return;
    }

    const updatedReviews = [
      ...(selectedReservation.reviews || []),
      { user: user.displayName || '匿名ユーザー', review }
    ];

    const stallRef = doc(db, "stalls", selectedReservation.id);
    await updateDoc(stallRef, {
      reviews: updatedReviews,
    });

    setSelectedReservation((prev) => ({
      ...prev,
      reviews: updatedReviews,
    }));

    setReview(""); // フォームをリセット
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
    fetchStalls();
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded || !currentPosition) return <div>Loading Maps...</div>;

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <button type="submit">追加</button>
      </form>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={currentPosition}
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
            onClick={() => handleMarkerClick(stall)}
          />
        ))}
        {selectedLocation && (
          <Marker position={selectedLocation} />
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

      {/* 予約情報の表示モーダル */}
      {selectedReservation && (
        <div className="reservation-info-modal">
          <div className="modal-content">
            <h2>予約情報</h2>
            <p>出店名: {selectedReservation.shopName}</p>
            <p>場所: ({selectedReservation.lat}, {selectedReservation.lng})</p>
            <p>紹介文: {selectedReservation.description}</p>
            <ul>
              {selectedReservation.menu && selectedReservation.menu.map((item, index) => (
                <li key={index}>{item.dish} - {item.price}円</li>
              ))}
            </ul>
            <h3>レビュー</h3>
            <ul>
              {selectedReservation.reviews && selectedReservation.reviews.map((rev, index) => (
                <li key={index}><strong>{rev.user}:</strong> {rev.review}</li>
              ))}
            </ul>
            {user ? (
              <>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="レビューを入力"
                />
                <button onClick={handleReviewSubmit}>レビューを投稿</button>
              </>
            ) : (
              <p>レビューを投稿するにはログインしてください。</p>
            )}
            <button onClick={() => setSelectedReservation(null)}>閉じる</button>
          </div>
        </div>
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
          overflow-y: auto;
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
          display: flex;
          justify-content: space-around;
          width: 100%;
        }

        .nav-bar a {
          color: #333;
          text-decoration: none;
          padding: 10px;
          font-size: 16px;
          text-align: center;
          flex: 1;
        }

        .nav-bar a.active {
          font-weight: bold;
          color: #000;
        }

        .reservation-info-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .modal-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .modal-content h2 {
          margin-bottom: 20px;
        }

        .modal-content ul {
          list-style: none;
          padding: 0;
        }

        .modal-content li {
          margin-bottom: 10px;
        }

        .modal-content textarea {
          width: 100%;
          height: 80px;
          margin-top: 10px;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        .modal-content button {
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .modal-content button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}
