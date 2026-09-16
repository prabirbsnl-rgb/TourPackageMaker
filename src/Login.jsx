

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";



const UserIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6" />
  </svg>
);

const LockIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15" r="1" />
  </svg>
);



const CrownIcon = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 18h16" />
    <path d="M5 18l-1-9 5 4 3-6 3 6 5-4-1 9" />
  </svg>
);





const CompassIcon = ({ size = 23 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
  </svg>
);

const RouteIcon = ({ size = 23 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="5" r="2" />
    <circle cx="18" cy="19" r="2" />
    <path d="M6 7v3c0 2 1.5 3 3.5 3h5c2 0 3.5 1 3.5 3v1" />
  </svg>
);

const HeartIcon = ({ size = 23 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
  </svg>
);



export default function Login({ onLogin }) {

    const [loginType, setLoginType] = useState("user");

    const [loggingIn, setLoggingIn] = useState(false);

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

            if (!password) {
                setError("Enter your password.");
                return;
            }

            /*
             * -----------------------------------------
             * ADMIN LOGIN
             * -----------------------------------------
             *
             * Only the administrator username is allowed
             * when Admin is selected.
             */

            if (
                loginType === "admin" &&
                normalizedUsername !== "admin"
            ) {
                setError(
                    "Only the Admin account can use Admin Login."
                );
                return;
            }

            /*
             * -----------------------------------------
             * USER LOGIN
             * -----------------------------------------
             *
             * Staff usernames are resolved through the
             * existing loginDirectory collection.
             */

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
                setError(
                    "Invalid username or password."
                );
                return;
            }

            const loginData =
                loginDirectorySnapshot.data();

            const loginEmail =
                loginData?.loginEmail;

            if (!loginEmail) {
                setError(
                    "Invalid username or password."
                );
                return;
            }

            /*
             * User mode must not allow an Admin account.
             */

            if (
                loginType === "user" &&
                (
                    loginData?.role === "admin" ||
                    normalizedUsername === "admin"
                )
            ) {
                setError(
                    "Please use Admin Login for the administrator account."
                );
                return;
            }

            /*
             * -----------------------------------------
             * FIREBASE AUTHENTICATION
             * -----------------------------------------
             */

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

            setError(
                "Invalid username or password."
            );

              } finally {
        setLoggingIn(false);
    }
};
       

    return (
  <>
    <style>
  {`
    input:focus {
      border-color: #4b9be8 !important;
      box-shadow: 0 0 0 3px rgba(75,155,232,.12);
    }

    button.login-button:hover:not(:disabled) {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }

    button.login-button:active:not(:disabled) {
      transform: translateY(0);
      filter: brightness(0.98);
    }
  `}
</style>


  <div
    style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
      boxSizing: "border-box",
    backgroundImage: "url('/login-background.png')",
backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",
      overflow: "hidden"
    }}
  >
   {/* SINGLE LOGIN CARD */}
<div
  style={{
  width: "min(430px, 94vw)",
  borderRadius: "0",
  overflow: "visible",
  background: "transparent",
  boxShadow: "none",
  border: "none",
  boxSizing: "border-box"
}}
>

      
{/* LOGIN CONTENT */}
<div
  style={{
    padding: "14px 34px 16px",
  background: "transparent",
  }}
>

        {/* BRAND */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "14px"
          }}
        >
          <img
  src="/orbitz-login-logo.png"
  alt="Orbitz Holidays"
  style={{
    display: "block",
   width: "150px",
    height: "auto",
    margin: "0 auto"
  }}
/>

          <div
            style={{
              marginTop: "5px",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#7188a0"
            }}
          >
            ANYWHERE, ANYTIME, AROUND THE WORLD 🌍
          </div>
        </div>

        {/* TITLE */}
        <div
          style={{
            textAlign: "center",
           marginBottom: "10px"
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#173e68"
            }}
          >
            User Login
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "13px",
              color: "#7188a0"
            }}
          >
            Access your Orbitz Holidays account
          </div>
        </div>

        {/* ADMIN / USER SWITCH */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "44px",
marginBottom: "12px",
            borderRadius: "25px",
          background: "transparent",
border: "none",
boxShadow: "none",
backdropFilter: "none",
WebkitBackdropFilter: "none",
            padding: "3px",
            boxSizing: "border-box"
          }}
        >
          <button
  type="button"
  onClick={() => {
    setLoginType("admin");
    setError("");
  }}
  style={{
  flex: 1,
  height: "36px",
  border: "none",
  borderRadius: "21px",
  background:
    loginType === "admin"
      ? "linear-gradient(135deg, #1683dc, #075db7)"
      : "transparent",
  color:
    loginType === "admin"
      ? "#ffffff"
      : "#173e68",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all .18s ease",
  display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  }}
>
  <CrownIcon size={16} />
  Admin
</button>

          {/* TRUE CENTER DIVIDER */}
          <div
            style={{
              width: "1px",
              height: "22px",
              background: "#c7d6e5",
              flexShrink: 0
            }}
          />

          <button
  type="button"
  onClick={() => {
    setLoginType("user");
    setError("");
  }}
 style={{
  flex: 1,
  height: "36px",
  border: "none",
  borderRadius: "21px",
  background:
    loginType === "user"
      ? "linear-gradient(135deg, #1683dc, #075db7)"
      : "transparent",
  color:
    loginType === "user"
      ? "#ffffff"
      : "#173e68",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all .18s ease",
  display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  }}
>
  <UserIcon size={16} />
  User
</button>
        </div>

        {/* USERNAME */}
        <div
  style={{
    position: "relative",
   marginBottom: "8px"
  }}
>
  <div
    style={{
      position: "absolute",
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#5d7b9a",
      display: "flex",
      pointerEvents: "none"
    }}
  >
    <UserIcon size={18} />
  </div>

  <input
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleLogin();
    }}
    style={{
      width: "100%",
     height: "46px",
      padding: "0 15px 0 44px",
      borderRadius: "11px",
      fontSize: "14px",
      boxSizing: "border-box",
      color: "#263f59",
      outline: "none",
      
      background: "transparent",
border: "none",
boxShadow: "none",
backdropFilter: "none",
WebkitBackdropFilter: "none"
       }}
  />
</div>

       {/* PASSWORD */}
<div
  style={{
    position: "relative",
   marginBottom: "12px"
  }}
>
  {/* LOCK ICON */}
  <div
    style={{
      position: "absolute",
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#5d7b9a",
      display: "flex",
      pointerEvents: "none"
    }}
  >
    <LockIcon size={18} />
  </div>

  <input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") handleLogin();
  }}
  style={{
    width: "100%",
    height: "46px",
    padding: "0 44px",
    boxSizing: "border-box",
    borderRadius: "11px",
   background: "transparent",
border: "none",
boxShadow: "none",
backdropFilter: "none",
WebkitBackdropFilter: "none",
    fontSize: "14px",
    color: "#263f59",
    outline: "none"
  }}
/>

  
</div>


        {/* ERROR */}
        {error && (
          <div
            style={{
              marginBottom: "12px",
              textAlign: "center",
              color: "#c62828",
              fontSize: "13px",
              fontWeight: 600
            }}
          >
            {error}
          </div>
        )}

        {/* LOGIN BUTTON */}
       <button
  type="button"
  className="login-button"
  onClick={handleLogin}
  disabled={loggingIn}
  style={{
    width: "100%",
    height: "48px",
    border: "none",
    borderRadius: "11px",
    background:
      "linear-gradient(90deg, #0f9b8e, #08766d)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    cursor: loggingIn ? "default" : "pointer",
    opacity: loggingIn ? 0.75 : 1,
    boxShadow:
      "0 8px 18px rgba(8,118,109,.24)",
      
  }}
>
  {loggingIn ? "Signing in..." : "Login  →"}
</button>

        {/* BOTTOM DIVIDER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
           marginTop: "12px",
marginBottom: "10px"
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#d7e2ec"
            }}
          />

          <span
            style={{
              fontSize: "11px",
              color: "#7188a0",
              whiteSpace: "nowrap"
            }}
          >
            Welcome to Orbitz Holidays
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#d7e2ec"
            }}
          />
        </div>

       {/* FEATURES */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    textAlign: "center",
    marginTop: "2px"
  }}
>
  {/* EXPLORE */}
  <div>
    <div
      style={{
       width: "34px",
height: "34px",
       margin: "0 auto 4px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,120,223,.08)",
        color: "#0878df"
      }}
    >
      <CompassIcon size={21} />
    </div>

    <div
      style={{
        fontSize: "11px",
        lineHeight: "15px",
        fontWeight: 600,
        color: "#607b96"
      }}
    >
      Explore
      <br />
      Destinations
    </div>
  </div>

  {/* PLAN */}
  <div>
    <div
      style={{
       width: "34px",
height: "34px",
       margin: "0 auto 4px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,120,223,.08)",
        color: "#0878df"
      }}
    >
      <RouteIcon size={21} />
    </div>

    <div
      style={{
        fontSize: "11px",
        lineHeight: "15px",
        fontWeight: 600,
        color: "#607b96"
      }}
    >
      Plan Your
      <br />
      Journey
    </div>
  </div>

  {/* MEMORIES */}
  <div>
    <div
      style={{
       width: "34px",
height: "34px",
       margin: "0 auto 4px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,120,223,.08)",
        color: "#0878df"
      }}
    >
      <HeartIcon size={21} />
    </div>

    <div
      style={{
        fontSize: "11px",
        lineHeight: "15px",
        fontWeight: 600,
        color: "#607b96"
      }}
    >
      Create
      <br />
      Memories
    </div>
  </div>
</div>

      </div>
    </div>
  </div>
  </>
);
}