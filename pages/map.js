// components/AddStallForm.js

"use client"; // これを追加して、コンポーネントがクライアントで実行されることを示します

import { useState } from "react";
import { db } from '../lib/firebase';
import { collection, addDoc } from "firebase/firestore";

export default function AddStallForm() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [name, setName] = useState("");

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="出店名"
        />
        <input
          type="text"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="緯度"
        />
        <input
          type="text"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="経度"
        />
        <button type="submit">追加</button>
      </form>



    </div>
  );
}



  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "stalls"), {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      name,
      confirmed: false
    });
    setLat("");
    setLng("");
    setName("");
  };
