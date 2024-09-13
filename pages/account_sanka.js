import styled from 'styled-components';

export default function AccountSanka() {
  // ユーザーの名前とアイコンを取得します。仮に静的データとして扱いますが、実際にはサーバーから取得することになります。
  const userName = "参加者の名前"; // ここに実際のユーザーの名前を設定します
  const userIcon = "/path/to/user/icon.png"; // ここにユーザーのアイコンのパスを設定します

  return (
    <Container>
      <ProfileContainer>
        <UserIcon src={userIcon} alt={`${userName}のアイコン`} />
        <UserName>{userName}</UserName>
      </ProfileContainer>
      <BottomNav>
        <NavItem href="/home">
          <NavIcon src="/path/to/home/icon.png" alt="Home Icon" />
          <NavLabel>Home</NavLabel>
        </NavItem>
        <NavItem href="/orders">
          <NavIcon src="/path/to/orders/icon.png" alt="Orders Icon" />
          <NavLabel>Orders</NavLabel>
        </NavItem>
        <NavItem href="/promotions">
          <NavIcon src="/path/to/promotions/icon.png" alt="Promotions Icon" />
          <NavLabel>Promotions</NavLabel>
        </NavItem>
        <NavItem href="/account_sanka">
          <NavIcon src="/path/to/account/icon.png" alt="Account Icon" />
          <NavLabel>Account</NavLabel>
        </NavItem>
      </BottomNav>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

const UserIcon = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserName = styled.h1`
  margin-top: 20px;
  font-size: 24px;
  color: #333;
`;

const BottomNav = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  background-color: #ffffff;
  border-top: 1px solid #ccc;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
`;

const NavIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-bottom: 5px;
`;

const NavLabel = styled.span`
  font-size: 12px;
  color: #333;
`;
