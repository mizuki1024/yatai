import React from 'react';
import Link from 'next/link';
import styles from '../styles/Account.module.css';

const accountData = {
  storeName: 'Tasty Street Food',
  profilePic: '/store.jpg',
  rating: 4.5,
  reviewCount: 120,
  description: 'Best street food in town! We offer a variety of dishes that are both delicious and affordable.',
  reviews: [
    { id: 1, user: 'John', comment: 'Great food and amazing service!' },
    { id: 2, user: 'Sarah', comment: 'Loved the ambiance and the food was top-notch.' },
    { id: 3, user: 'Michael', comment: 'A bit crowded but the food made up for it.' },
  ],
  menu: [
    { id: 1, image: '/dish1.jpg', name: 'Grilled Chicken', price: '$10.99' },
    { id: 2, image: '/dish2.jpg', name: 'Beef Kebab', price: '$12.50' },
    { id: 3, image: '/dish3.jpg', name: 'Veggie Wrap', price: '$8.75' },
  ]
};

const Account = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={accountData.profilePic} alt="Store" className={styles.storeImage} />
        <h1>{accountData.storeName}</h1>
        <p className={styles.description}>{accountData.description}</p>
        <div className={styles.rating}>
          <span>{`Rating: ${accountData.rating}/5 (${accountData.reviewCount} reviews)`}</span>
        </div>
      </div>
      
      <div className={styles.reviews}>
        <h2>Reviews</h2>
        {accountData.reviews.map(review => (
          <div key={review.id} className={styles.reviewItem}>
            <h3>{review.user}</h3>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
      
      <div className={styles.menu}>
        <h2>Menu</h2>
        <div className={styles.dishes}>
          {accountData.menu.map(dish => (
            <div key={dish.id} className={styles.dishItem}>
              <img src={dish.image} alt={dish.name} className={styles.dishImage} />
              <h3>{dish.name}</h3>
              <p>{dish.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.navigation}>
        <Link href="/">
          <button>Home</button>
        </Link>
        <Link href="/orders">
          <button>Orders</button>
        </Link>
        <Link href="/promotions">
          <button>Promotions</button>
        </Link>
        <Link href="/account">
          <button className={styles.active}>Account</button>
        </Link>
      </div>
    </div>
  );
};

export default Account;
