



let cachedAccessToken = null;
let tokenExpiresAt = 0;

async function ensureGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) return;

  await new Promise((resolve, reject) => {
    let script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", resolve, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Unable to load Google authentication.")),
      { once: true }
    );
  });

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google authentication is not available.");
  }
}

export async function requestGoogleDriveAccessToken() {
  await ensureGoogleIdentityServices();

  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      reject(new Error("Google OAuth Client ID is missing."));
      return;
    }

    const tokenClient =
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",

        callback: (response) => {
          if (response.error || !response.access_token) {
            cachedAccessToken = null;
            tokenExpiresAt = 0;

            reject(
              new Error(
                response.error_description ||
                response.error ||
                "Google Drive authorization failed."
              )
            );
            return;
          }

          cachedAccessToken = response.access_token;

          tokenExpiresAt =
            Date.now() +
            (Number(response.expires_in || 3600) - 60) * 1000;

          resolve(cachedAccessToken);
        },

        error_callback: (error) => {
          reject(
            new Error(
              error.message || "Google authorization popup failed."
            )
          );
        },
      });

    tokenClient.requestAccessToken({ prompt: "" });
  });
}

export function clearGoogleDriveAccessToken() {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
}
