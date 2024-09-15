// pages/register-organizer.js
import { useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styled from "styled-components";
import { useRouter } from 'next/router';

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
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

export default function RegisterOrganizer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState(""); // 追加: 自己紹介文

  const router = useRouter();

  const handleImageUpload = async (image) => {
    const imageRef = ref(storage, `profile_pictures/${image.name}`);
    const snapshot = await uploadBytes(imageRef, image);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const profilePictureURL = profilePicture ? await handleImageUpload(profilePicture) : null;

      await setDoc(doc(db, "organizers", user.uid), {
        email: user.email,
        profile: {
          name: name,
          profilePicture: profilePictureURL,
          bio: bio, // 追加: 自己紹介文を保存
        }
      });

      alert("Registration successful!");
      router.push(`/organizer-profile?uid=${user.uid}`); // リダイレクト先のURLを指定
    } catch (error) {
      console.error("Error registering:", error);
      alert("Error registering");
    }
  };

  return (
    <Container>
      <Title>Organizer Registration</Title>
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
        type="file"
        onChange={(e) => setProfilePicture(e.target.files[0])}
      />
      <Textarea
        placeholder="Tell us about yourself"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <Button onClick={handleRegister}>Register</Button>
    </Container>
  );
}
