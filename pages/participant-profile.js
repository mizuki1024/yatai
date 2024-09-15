import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
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

const ProfileInfo = styled.div`
  margin: 20px 0;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #0070f3;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;

  &:hover {
    background-color: #005bb5;
  }
`;

export default function ParticipantProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const router = useRouter();
  const { uid } = router.query;

  useEffect(() => {
    if (uid) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'participants', uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data.profile);
            setName(data.profile.name);
            setBio(data.profile.bio);
          } else {
            setError('No profile data available.');
          }
        } catch (error) {
          setError('Error fetching profile data.');
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [uid]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'participants', uid);
      await updateDoc(docRef, {
        profile: {
          name,
          bio
        }
      });
      setProfile({ name, bio });
      setEditing(false);
    } catch (error) {
      setError('Error updating profile.');
    }
  };

  const handleNavigate = () => {
    router.push({
      pathname: '/ParticipantMap',
      query: { uid } // uidをクエリパラメータとして渡す
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Container>
      <Title>Participant Profile</Title>
      {editing ? (
        <ProfileInfo>
          <label>
            <strong>Name:</strong>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            <strong>Bio:</strong>
            <Textarea
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleNavigate}>Go to Map</Button> {/* 追加ボタン */}
        </ProfileInfo>
      ) : (
        <ProfileInfo>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <Button onClick={handleEdit}>Edit</Button>
          <Button onClick={handleNavigate}>Go to Map</Button> {/* 追加ボタン */}
        </ProfileInfo>
      )}
    </Container>
  );
}
