



import { applicationDefault, initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ID = "orbitzquote";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID,
      });

const adminAuth = getAuth(app);

export async function verifyBackupAdmin(req) {
  const firebaseToken = req.headers["x-firebase-id-token"];

  if (typeof firebaseToken !== "string" || !firebaseToken.trim()) {
    return {
      ok: false,
      status: 401,
      error: "Authentication required.",
    };
  }

  let decodedToken;

 
  try {
    decodedToken = await adminAuth.verifyIdToken(firebaseToken.trim());
  } catch (error) {
    const safeCode =
      typeof error?.code === "string"
        ? error.code
        : "unknown";

    console.error(
      `[Backup Auth] Firebase ID-token verification failed. Code: ${safeCode}`
    );

    return {
      ok: false,
      status: 401,
      error: "Invalid or expired authentication token.",
    };
  }


  if (decodedToken.admin !== true) {
    return {
      ok: false,
      status: 403,
      error: "Active Admin access required.",
    };
  }

  return { ok: true, uid: decodedToken.uid };
}
