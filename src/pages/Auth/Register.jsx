import { useState } from "react";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import { register } from "@/services/auth.service";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    await register({ email, password });
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Register</h1>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Create account</Button>
    </form>
  );
}
