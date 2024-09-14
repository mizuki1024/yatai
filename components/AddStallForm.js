"use client"; // クライアントサイドで実行されることを明示

import React, { useState, useCallback, useEffect } from "react";
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Authenticationのインポート
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import ReservationModal from "./ReservationModal";  
import Link from 'next/link';

const mapContainerStyle = {
  width: "100%",
  height: "100vh", // 地図の高さを設定
};

const center = {
  lat: 26.2124, // 初期の中心座標 (例: 沖縄)
  lng: 127.6809,
};

export default function AddStallForm() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "あなたのAPIキー", // 自分のAPIキーに置き換えてください
  });

  const [name, setName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null); // 選択された位置を管理
  const [stalls, setStalls] = useState([]); // Firestoreから取得した屋台の位置を保存
  const [selectedStall, setSelectedStall] = useState(null); // モーダルで表示するための選択された屋台
  const [selectedReservation, setSelectedReservation] = useState(null); // 選択された予約情報を管理
  const [user, setUser] = useState(null); // 認証されたユーザー情報を管理

  // Firebase Authenticationを使用して現在のユーザーを取得
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // ログインしているユーザーを設定
      } else {
        setUser(null); // ユーザーがログインしていない場合はnull
      }
    });

    return () => unsubscribe();
  }, []);

  // Firestoreからリアルタイムでデータを取得
  const fetchStalls = useCallback(() => {
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

  useEffect(() => {
    fetchStalls();
  }, [fetchStalls]);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
  }, []);

  const handleMarkerClick = (stall) => {
    if (!stall.confirmed) { // confirmed が false の場合は予約モーダルを表示
      setSelectedStall(stall);
    } else { // confirmed が true の場合は予約情報を表示
      setSelectedReservation(stall);
    }
  };

  const handleReservationComplete = async (stall) => {
    if (!user) {
      alert("予約を行うにはログインが必要です。");
      return;
    }

    // Firestore に予約情報を登録する
    const stallRef = doc(db, "stalls", stall.id);
    await updateDoc(stallRef, {
      confirmed: true,
      reservedBy: user.uid, // 予約したユーザーのID
      shopName: user.displayName, // Firebase Authenticationのディスプレイネーム
      description: "店舗の紹介文をここに入力", // 店の紹介文
      menu: [ // 料理とその値段を実際のユーザーデータに合わせて取得
        { dish: "醤油ラーメン", price: 700 },
        { dish: "味噌ラーメン", price: 800 }
      ],
      reviews: [] // 初期レビューは空で設定
    });

    fetchStalls(); // 予約完了後にデータを再取得
    setSelectedStall(null); // モーダルを閉じる
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
    fetchStalls(); // 新しいデータを追加後に再取得
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
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

        .modal-content button {
          margin-top: 20px;
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
