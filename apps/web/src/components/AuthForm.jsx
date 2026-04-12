import { useState } from "react";

const initialForm = {
  fullName: "",
  email: "",
  password: ""
};

export default function AuthForm({ mode, loading, onSubmit }) {
  const [form, setForm] = useState(initialForm);

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm((prev) => ({
      ...prev,
      password: ""
    }));
  };

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <h2>{mode === "login" ? "Login" : "Create account"}</h2>
      {mode === "register" && (
        <label>
          Full name
          <input
            type="text"
            value={form.fullName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            required
            minLength={2}
          />
        </label>
      )}

      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          required
          minLength={6}
        />
      </label>

      <button disabled={loading} type="submit">
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
      </button>
    </form>
  );
}
