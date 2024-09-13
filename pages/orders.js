import React from 'react';
import Link from 'next/link';
import styles from '../styles/Orders.module.css';

const ordersData = [
  { id: 1, user: 'Alice', timeLog: '5 minutes ago', order: '2x Pizza, 1x Coke', profilePic: '/profile1.png' },
  { id: 2, user: 'Bob', timeLog: '10 minutes ago', order: '1x Burger, 1x Fries', profilePic: '/profile2.png' },
  { id: 3, user: 'Charlie', timeLog: '15 minutes ago', order: '1x Salad, 1x Water', profilePic: '/profile3.png' },
];

const Orders = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Orders</h1>
      <div className={styles.orderList}>
        {ordersData.map((order) => (
          <div key={order.id} className={styles.orderItem}>
            <div className={styles.userInfo}>
              <img src={order.profilePic} alt={`${order.user} profile`} className={styles.profilePic} />
              <div className={styles.userDetails}>
                <h2 className={styles.userName}>{order.user}</h2>
                <div className={styles.timeLog}>{order.timeLog}</div>
              </div>
            </div>
            <div className={styles.orderDetails}>{order.order}</div>
          </div>
        ))}
      </div>

      <div className={styles.navigation}>
        <Link href="/">
          <button>Home</button>
        </Link>
        <Link href="/orders">
          <button className={styles.active}>Orders</button>
        </Link>
        <Link href="/promotions">
          <button>Promotions</button>
        </Link>
        <Link href="/account">
          <button>Account</button>
        </Link>
      </div>
    </div>
  );
};

export default Orders;
