
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import styled from 'styled-components';
import { useRouter } from 'next/router';

// バリデーションスキーマを定義
const schema = yup.object().shape({
  name: yup.string().required("名前は必須です"),
  email: yup.string().email("有効なメールアドレスを入力してください").required("メールアドレスは必須です"),
  password: yup.string().min(6, "パスワードは最低6文字です").required("パスワードは必須です"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], "パスワードが一致しません")
    .required("パスワード確認は必須です"),
  userType: yup.string().required("ユーザータイプを選択してください"),
  eventName: yup.string().when('userType', {
    is: 'organizer',
    then: yup.string().required("イベント名は必須です"),
  }),
  storeName: yup.string().when('userType', {
    is: 'stall',
    then: yup.string().required("出店名は必須です"),
  }),
  topIcon: yup.mixed().required("トップ画面のアイコンをアップロードしてください"),
  homeIcon: yup.mixed().required("ホーム画面のアイコンをアップロードしてください"),
});

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const router = useRouter();  // ルーターを使用してページ遷移を制御
  const userType = watch("userType");  // フォームから直接ユーザータイプを監視

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("userType", data.userType);
      if (data.eventName) formData.append("eventName", data.eventName);
      if (data.storeName) formData.append("storeName", data.storeName);
      formData.append("topIcon", data.topIcon[0]);
      formData.append("homeIcon", data.homeIcon[0]);

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log("登録が完了しました！");
        if (userType === 'participant') {
          router.push('/account_sanka');  // 参加者の場合、Accountページにリダイレクト
        } else {
          // 他のユーザータイプに応じて異なるページに遷移させることも可能
        }
      } else {
        console.error("登録に失敗しました");
      }
    } catch (error) {
      console.error("エラーが発生しました", error);
    }
  };

  return (
    <FormContainer>
      {userType === "" ? (
        <SelectUserType setUserType={setUserType} />
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <InputContainer>
            <Label>名前</Label>
            <Input {...register("name")} />
            <Error>{errors.name?.message}</Error>
          </InputContainer>

          <InputContainer>
            <Label>メールアドレス</Label>
            <Input {...register("email")} />
            <Error>{errors.email?.message}</Error>
          </InputContainer>

          <InputContainer>
            <Label>パスワード</Label>
            <Input type="password" {...register("password")} />
            <Error>{errors.password?.message}</Error>
          </InputContainer>

          <InputContainer>
            <Label>パスワード確認</Label>
            <Input type="password" {...register("confirmPassword")} />
            <Error>{errors.confirmPassword?.message}</Error>
          </InputContainer>

          {userType === "organizer" && (
            <InputContainer>
              <Label>イベント名</Label>
              <Input {...register("eventName")} />
              <Error>{errors.eventName?.message}</Error>
            </InputContainer>
          )}

          {userType === "stall" && (
            <InputContainer>
              <Label>出店名</Label>
              <Input {...register("storeName")} />
              <Error>{errors.storeName?.message()}</Error>
            </InputContainer>
          )}

          <InputContainer>
            <Label>トップ画面のアイコン</Label>
            <Input type="file" {...register("topIcon")} />
            <Error>{errors.topIcon?.message}</Error>
          </InputContainer>

          <InputContainer>
            <Label>ホーム画面のアイコン</Label>
            <Input type="file" {...register("homeIcon")} />
            <Error>{errors.homeIcon?.message}</Error>
          </InputContainer>

          <SubmitButton type="submit">登録</SubmitButton>
        </Form>
      )}
    </FormContainer>
  );
}

// ユーザータイプ選択画面
function SelectUserType({ setUserType }) {
  return (
    <Form>
      <InputContainer>
        <Label>ユーザータイプを選択してください</Label>
        <Select onChange={(e) => setUserType(e.target.value)}>
          <option value="">選択してください</option>
          <option value="organizer">主催者</option>
          <option value="stall">出店者</option>
          <option value="participant">参加者</option>
        </Select>
      </InputContainer>
    </Form>
  );
}

// スタイル設定
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f0f5;
  padding: 20px;
  overflow-y: auto;
`;

const Form = styled.form`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const InputContainer = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
  }
`;

const Error = styled.p`
  margin-top: 5px;
  font-size: 12px;
  color: #ff6b6b;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;
