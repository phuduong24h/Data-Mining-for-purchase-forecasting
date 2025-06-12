import React from "react";
import { Mang } from "./Mang";

type Props = {
  label: string;
};

const a = 3;
const b = "4";

function c(a: any, b: any) {
  return a + b;
}

type User = {
  name: string;
  age: number;
};

const updateUser = (user: Partial<User>) => {
  // Có thể chỉ truyền 1 phần thông tin
  console.log(user);
};

updateUser({ name: "Alice" }); // OK
updateUser({}); // OK
type Profile = {
  username?: string;
  email?: string;
};

const createFullProfile = (profile: Required<Profile>) => {
  console.log(profile.username, profile.email);
};

createFullProfile({ username: "admin", email: "a@b.com" }); // ✅ OK

const MyButton = ({ label }: Props) => {
  // Ví dụ gọi throwError hay loopForever nếu muốn test:
  // throwError();
  // loopForever();

  return <button>{c(a, b)}</button>;
};

export default MyButton;
