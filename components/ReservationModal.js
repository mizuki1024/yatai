// components/ReservationModal.js
"use client"; // これを追加します

import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ReservationModal({ stall, onClose, onComplete }) {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stallRef = doc(db, "stalls", stall.id);
    await updateDoc(stallRef, { confirmed: true, name });
    onComplete({ ...stall, confirmed: true, name });
  };

  return (
    <div style={modalStyle}>
      <form onSubmit={handleSubmit}>
        <button type="submit">予約する</button>
        
        <button type="button" onClick={onClose}>キャンセル</button>
      </form>
    </div>
  );
}

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  zIndex: 1000,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};
