



import { requestGoogleDriveAccessToken } from "./googleDriveAuth";

async function uploadSinglePhoto(file, folderId) {
  if (!(file instanceof File)) {
    throw new Error("Invalid photo file.");
  }

  if (!folderId) {
    throw new Error("Google Drive destination folder is missing.");
  }

  const accessToken = await requestGoogleDriveAccessToken();

  const boundary = `orbitz_${crypto.randomUUID()}`;
  const mimeType = file.type || "application/octet-stream";

  const metadata = {
    name: file.name,
    mimeType,
    parents: [folderId],
  };

  const body = new Blob(
    [
      `--${boundary}\r\n`,
      "Content-Type: application/json; charset=UTF-8\r\n\r\n",
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\n`,
      `Content-Type: ${mimeType}\r\n\r\n`,
      file,
      `\r\n--${boundary}--`,
    ],
    {
      type: `multipart/related; boundary=${boundary}`,
    }
  );

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || `Photo upload failed: ${file.name}`
    );
  }

  return {
    id: result.id,
    driveFileId: result.id,
    name: result.name,
    mimeType: result.mimeType,
    webViewLink: result.webViewLink || "",
    thumbnailLink: result.thumbnailLink || "",
    imageStoragePending: false,
  };
}


export async function uploadHotelPhotos(files, folderId) {
  if (!Array.isArray(files)) {
    throw new Error("Photo list must be an array.");
  }

  const uploadedPhotos = [];
  const failedPhotos = [];

  for (const file of files) {
    try {
      const metadata = await uploadSinglePhoto(file, folderId);

      uploadedPhotos.push({
        file,
        metadata,
      });
    } catch (error) {
      console.error(
        `Google Drive upload failed for ${file?.name || "photo"}:`,
        error
      );

      failedPhotos.push({
        file,
        error: error.message || "Photo upload failed.",
      });
    }
  }

  return {
    uploadedPhotos,
    failedPhotos,
  };
}



export async function getGoogleDrivePhotoPreviewUrl(driveFileId, accessToken) {
  if (!driveFileId) {
    throw new Error("Google Drive photo ID is missing.");
  }

  if (!accessToken) {
  throw new Error("Google Drive is not connected. Please connect Drive first.");
}

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      driveFileId
    )}?alt=media`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve the Google Drive photo.");
  }

  const imageBlob = await response.blob();

  return URL.createObjectURL(imageBlob);
}




export async function deleteGoogleDrivePhoto(driveFileId) {
  if (!driveFileId) {
    throw new Error("Google Drive photo ID is missing.");
  }

  const accessToken = await requestGoogleDriveAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      driveFileId
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    let errorMessage = "Unable to delete the Google Drive photo.";

    try {
      const result = await response.json();
      errorMessage = result.error?.message || errorMessage;
    } catch {
      // Keep the default error message if no JSON response is available.
    }

    throw new Error(errorMessage);
  }

  return {
    success: true,
    driveFileId,
  };
}

