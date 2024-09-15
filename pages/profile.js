import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  min-height: 80vh; /* 画面の高さに応じて調整 */
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const StoreName = styled.h2`
  margin: 0;
  color: #0070f3;
`;

const Introduction = styled.p`
  color: #555;
`;

const DishContainer = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
`;

const DishImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
`;

const DishName = styled.h3`
  margin: 0;
`;

const DishPrice = styled.p`
  margin: 0;
  color: #0070f3;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #0070f3;
  color: white;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.1);
`;

const FooterButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export default function Profile() {
  const router = useRouter();
  const { uid } = router.query; // URL パラメータからユーザーIDを取得
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (uid) {
      const fetchProfile = async () => {
        try {
          const userDoc = doc(db, 'users', uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, [uid]);

  if (!profile) return <p>Loading...</p>;

  return (
    <Container>
      <Title>Profile</Title>
      <ProfileSection>
        <ProfileImage src={profile.profile.profilePicture} alt="Profile Picture" />
        <ProfileInfo>
          <StoreName>{profile.profile.storeName}</StoreName>
          <Introduction>{profile.profile.storeIntroduction}</Introduction>
        </ProfileInfo>
      </ProfileSection>
      <h2>Dishes</h2>
      {profile.profile.dishes.map((dish, index) => (
        <DishContainer key={index}>
          {dish.dishPicture && <DishImage src={dish.dishPicture} alt={dish.dishName} />}
          <DishName>{dish.dishName}</DishName>
          <DishPrice>{dish.dishPrice}</DishPrice>
        </DishContainer>
      ))}
      <Footer>
        <FooterButton onClick={() => router.push('/profile')}>Profile</FooterButton>
        <FooterButton onClick={() => router.push('/VendorMap')}>Map</FooterButton>
      </Footer>
    </Container>
  );
}
