import { useState } from "react";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import { login } from "@/services/auth.service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Login</h1>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Sign in</Button>
    </form>
  );
}
