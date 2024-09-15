import { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { auth, db, storage } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

export default function SelectUserType() {
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter(); // useRouterを直接使用

  const handleImageUpload = async (image) => {
    const imageRef = ref(storage, `profile_pictures/${image.name}`);
    const snapshot = await uploadBytes(imageRef, image);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        if (user) {
          if (userType === "participant") {
            router.push(`/participant-profile?uid=${user.uid}`);
          } else if (userType === "vendor") {
            router.push(`/profile?uid=${user.uid}`);
          } else if (userType === "organizer") {
            router.push(`/organizer-profile?uid=${user.uid}`);
          } else {
            setError("Invalid user type.");
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let profilePictureURL = null;
        if (profilePicture) {
          profilePictureURL = await handleImageUpload(profilePicture);
        }

        if (userType === "vendor") {
          await setDoc(doc(db, "vendors", user.uid), {
            email: user.email,
            profile: { name, profilePicture: profilePictureURL, bio }
          });
          router.push(`/profile?uid=${user.uid}`);
        } else if (userType === "participant") {
          await setDoc(doc(db, "participants", user.uid), {
            email: user.email,
            profile: { name, bio }
          });
          router.push(`/participant-profile?uid=${user.uid}`);
        } else if (userType === "organizer") {
          await setDoc(doc(db, "organizers", user.uid), {
            email: user.email,
            profile: { name, profilePicture: profilePictureURL, bio }
          });
          router.push(`/organizer-profile?uid=${user.uid}`);
        } else {
          setError("Invalid user type.");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error:", error);
    }
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
  };

  return (
    <Container>
      <Title>{isLogin ? "Login" : "Register"} as {userType}</Title>
      {userType ? (
        <>
          {!isLogin && (
            <>
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
            </>
          )}
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
          {error && <p>{error}</p>}
          <Button onClick={handleAuth}>{isLogin ? "Login" : "Register"}</Button>
          <Button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Switch to Register" : "Switch to Login"}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => handleUserTypeSelection("vendor")}>Vendor</Button>
          <Button onClick={() => handleUserTypeSelection("participant")}>Participant</Button>
          <Button onClick={() => handleUserTypeSelection("organizer")}>Organizer</Button>
        </>
      )}
    </Container>
  );
}
