// pages/register.js
import { useState } from "react";
import { useRouter } from 'next/router';
import { auth, db, storage } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styled from "styled-components";

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  min-height: 100px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 5px;
  background-color: #0070f3;
  color: white;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #005bb5;
  }
`;

const DishContainer = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
`;

const AddDishButton = styled(Button)`
  background-color: #28a745;
  &:hover {
    background-color: #218838;
  }
`;

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState({
    storeName: "",
    profilePicture: null,
    dishes: [{ dishName: "", dishPrice: "", dishPicture: null }],
    storeIntroduction: ""
  });

  const router = useRouter();

  const handleImageUpload = async (image) => {
    if (!image) return null;
    const imageRef = ref(storage, `images/${image.name}`);
    const snapshot = await uploadBytes(imageRef, image);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const profilePictureURL = profile.profilePicture ? await handleImageUpload(profile.profilePicture) : null;
      const dishesWithUrls = await Promise.all(
        profile.dishes.map(async (dish) => {
          const dishPictureURL = dish.dishPicture ? await handleImageUpload(dish.dishPicture) : null;
          return { ...dish, dishPicture: dishPictureURL };
        })
      );

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: name,
        profile: {
          storeName: profile.storeName,
          profilePicture: profilePictureURL,
          dishes: dishesWithUrls,
          storeIntroduction: profile.storeIntroduction
        }
      });

      router.push(`/profile?uid=${user.uid}`);
      
    } catch (error) {
      console.error("Error registering:", error);
      alert("Error registering");
    }
  };

  const addDishField = () => {
    setProfile({
      ...profile,
      dishes: [...profile.dishes, { dishName: "", dishPrice: "", dishPicture: null }]
    });
  };

  const handleDishChange = (index, field, value) => {
    const updatedDishes = [...profile.dishes];
    updatedDishes[index][field] = value;
    setProfile({ ...profile, dishes: updatedDishes });
  };

  return (
    <Container>
      <Title>Register</Title>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Store Name"
        value={profile.storeName}
        onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
      />
      <Input
        type="file"
        onChange={(e) => setProfile({ ...profile, profilePicture: e.target.files[0] })}
      />
      <Textarea
        placeholder="Store Introduction"
        value={profile.storeIntroduction}
        onChange={(e) => setProfile({ ...profile, storeIntroduction: e.target.value })}
      />
      <h3>Dishes</h3>
      {profile.dishes.map((dish, index) => (
        <DishContainer key={index}>
          <Input
            type="text"
            placeholder="Dish Name"
            value={dish.dishName}
            onChange={(e) => handleDishChange(index, 'dishName', e.target.value)}
          />
          <Input
            type="text"
            placeholder="Dish Price"
            value={dish.dishPrice}
            onChange={(e) => handleDishChange(index, 'dishPrice', e.target.value)}
          />
          <Input
            type="file"
            onChange={(e) => handleDishChange(index, 'dishPicture', e.target.files[0])}
          />
        </DishContainer>
      ))}
      <AddDishButton onClick={addDishField}>Add another dish</AddDishButton>
      <Button onClick={handleRegister}>Register</Button>
    </Container>
  );
}
