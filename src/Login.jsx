
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
  setError("");

  try {
    const normalizedUsername =
  username.trim().toLowerCase();

if (!normalizedUsername) {
  setError("Enter your username.");
  return;
}

const loginDirectoryRef =
  doc(
    db,
    "loginDirectory",
    normalizedUsername
  );

const loginDirectorySnapshot =
  await getDoc(
    loginDirectoryRef
  );

if (!loginDirectorySnapshot.exists()) {
  setError("Invalid username.");
  return;
}

const loginData =
  loginDirectorySnapshot.data();

const loginEmail =
  loginData?.loginEmail;

if (!loginEmail) {
  setError("Invalid username.");
  return;
}

await signInWithEmailAndPassword(
  auth,
  loginEmail,
  password
);

    onLogin();

  } catch (err) {

      console.error(
      "🔥 LOGIN FAILED:",
      err
    );

    setError("Invalid username or password.");
  }
};

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          width: 380,
          background: "#fff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,.12)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#1E3A8A",
            marginBottom: 5,
          }}
        >
          Orbitz Holidays
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#6B7280",
            marginBottom: 25,
          }}
        >
          Staff Login
        </p>

        <input
  type="text"
  placeholder="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  style={{
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    border: "1px solid #ccc",
  }}
/>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: 15,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            border: "none",
            borderRadius: 8,
            background: "#2563EB",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}