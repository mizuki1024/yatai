// pages/_app.js
import { useEffect } from 'react';
import { analytics } from '../lib/firebase'; // Analytics をインポート

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (analytics) {
      // Analytics を使った初期化やログ記録の設定があればここに記述
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
