import React from 'react';
import Link from 'next/link';
import styles from '../styles/Promotions.module.css';

const Promotions = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Promotions</h1>
        <input className={styles.search} type="text" placeholder="Search" />
      </div>
      
      <div className={styles.newPromotion}>
        <h2>New Promotion</h2>
        <div className={styles.promotionItem}>
          <div>Free delivery over $20</div>
          <button className={styles.createButton}>Create</button>
        </div>
      </div>
      
      <div className={styles.existingPromotions}>
        <h2>Promotions</h2>
        <div className={styles.promotionItem}>
          <div>
            <div>$5 off for new customers</div>
            <div className={styles.expiry}>Expires in 4 days</div>
          </div>
          <button className={styles.editButton}>Edit</button>
        </div>
        
        <div className={styles.promotionItem}>
          <div>
            <div>10% off for returning customers</div>
            <div className={styles.expiry}>Expires in 10 days</div>
          </div>
          <button className={styles.editButton}>Edit</button>
        </div>
      </div>
      
      <div className={styles.footer}>
        <button className={styles.doneButton}>Done</button>
      </div>
      
      <div className={styles.navigation}>
        <button>Home</button>
        <Link href="/orders">
          <button>Orders</button>
        </Link>
        <button className={styles.active}>Promotions</button>
        <button>Account</button>
      </div>
    </div>
  );
};

export default Promotions;
