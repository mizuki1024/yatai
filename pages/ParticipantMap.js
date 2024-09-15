import React, { useState, useEffect } from "react";
import { db } from '../lib/firebase';
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100vh"
};

const center = {
  lat: 26.2124, // 沖縄の緯度
  lng: 127.6809 // 沖縄の経度
};

export default function ParticipantMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCHPcRdQg0ZxO0TISUyP9tMCvxupmZvtkc",
  });

  const [stalls, setStalls] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [review, setReview] = useState("");
  const [user, setUser] = useState(null);

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
    if (stall.confirmed) {
      setSelectedReservation(stall);
    } else {
      setSelectedReservation(null); // 確認済みでない場合はモーダルを表示しない
    }
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

    setReview("");
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
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

      {selectedReservation && (
        <div className="reservation-info-modal">
          <div className="modal-content">
            <h2>予約情報</h2>
            <p><strong>出店名:</strong> {selectedReservation.shopName}</p>
            <p><strong>場所:</strong> ({selectedReservation.lat}, {selectedReservation.lng})</p>
            <p><strong>紹介文:</strong> {selectedReservation.description}</p>
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
          <style jsx>{`
            .reservation-info-modal {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background-color: white;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              z-index: 1000;
              width: 80%;
              max-width: 600px;
            }
            .modal-content {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            textarea {
              width: 100%;
              height: 80px;
              margin-top: 10px;
              margin-bottom: 10px;
              padding: 10px;
              border-radius: 5px;
              border: 1px solid #ccc;
            }
            button {
              margin-top: 10px;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            }
            button:hover {
              background-color: #0056b3;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
