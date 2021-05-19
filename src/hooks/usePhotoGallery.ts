import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Storage } from "@capacitor/storage";
import { isPlatform } from "@ionic/react";
import { useEffect, useState } from "react";

const PHOTO_STORAGE = "photos";
export const usePhotoGallery = () => {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  useEffect(() => {
    const loadSaved = async () => {
      const { value } = await Storage.get({ key: PHOTO_STORAGE });
      const photosInStorage: UserPhoto[] = value ? JSON.parse(value) : [];

      if (!isPlatform("hybrid")) {
        for (let photo of photosInStorage) {
          const file = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data,
          });
          // Web platform only: Load the photo as base64 data
          photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
        }
      }
      setPhotos(photosInStorage);
    };
    loadSaved();
  }, []);
  const takePhoto = async () => {
    try {
      const cameraPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
      });
      const fileName = new Date().getTime() + ".jpeg";
      const savedFileImage = await savePicture(cameraPhoto, fileName);
      const newPhotos: UserPhoto[] = [savedFileImage, ...photos];
      Storage.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
      setPhotos(newPhotos);
    } catch (error) {
      console.log(error);
    }
  };

  const deletePhoto = async (photo: UserPhoto) => {
    // Remove this photo from the Photos reference data array
    const newPhotos = photos.filter((p) => p.filepath !== photo.filepath);

    // Update photos array cache by overwriting the existing photo array
    Storage.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });

    // delete photo file from filesystem
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf("/") + 1);
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data,
    });
    setPhotos(newPhotos);
  };

  return {
    photos,
    takePhoto,
    deletePhoto,
  };
};

export const savePicture = async (
  photo: Photo,
  fileName: string
): Promise<UserPhoto> => {
  let base64Data: string; //  = await base64FromPath(photo.webPath!);
  if (isPlatform("hybrid")) {
    const file = await Filesystem.readFile({
      path: photo.path!,
    });
    base64Data = file.data;
  } else {
    base64Data = await base64FromPath(photo.webPath!);
  }
  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data,
  });

  if (isPlatform("hybrid")) {
    // Display the new image by rewriting the 'file://' path to HTTP
    // Details: https://ionicframework.com/docs/building/webview#file-protocol
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
    };
  } else {
    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  }
};

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("method did not return a string");
      }
    };
    reader.readAsDataURL(blob);
  });
}
export type UserPhoto = {
  filepath: string;
  webviewPath?: string;
};