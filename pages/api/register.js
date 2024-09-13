import { db } from 'C:\\Users\\mizuk\\OneDrive\\ドキュメント\\tizu\\festival-stall-map\\lib\\firebase.js';
import { collection, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password, userType, eventName, storeName } = req.body;

    try {
      // Firestoreのユーザーコレクションにデータを追加
      const docRef = await addDoc(collection(db, "users"), {
        name,
        email,
        password, // 本番環境ではパスワードをハッシュ化することを強く推奨します
        userType,
        eventName: userType === 'organizer' ? eventName : null,
        storeName: userType === 'stall' ? storeName : null,
        createdAt: new Date().toISOString(),
      });

      res.status(200).json({ message: '登録が成功しました！', id: docRef.id });
    } catch (error) {
      console.error("Error adding document: ", error);
      res.status(500).json({ message: '登録に失敗しました', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'メソッドが許可されていません' });
  }
}
