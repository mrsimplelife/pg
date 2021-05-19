import {
  IonActionSheet,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { camera, close, trash } from "ionicons/icons";
import { useCallback, useState } from "react";
import { usePhotoGallery, UserPhoto } from "../hooks/usePhotoGallery";
import "./Tab2.css";

const Tab2: React.FC = () => {
  const [photoToDelete, setPhotoToDelete] = useState<UserPhoto>();

  const { takePhoto, photos, deletePhoto } = usePhotoGallery();

  const handleClickCamera = useCallback(() => takePhoto(), [takePhoto]);

  const handleCancel = useCallback(() => setPhotoToDelete(undefined), []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photo Gallery</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Photo Gallery</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* <ExploreContainer name="Tab 2 page" />
         */}
        <IonGrid>
          <IonRow>
            {photos.map((photo) => (
              <Photos
                key={photo.filepath}
                photo={photo}
                onClick={setPhotoToDelete}
              />
            ))}
          </IonRow>
        </IonGrid>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={handleClickCamera}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>
        <IonActionSheet
          isOpen={!!photoToDelete}
          buttons={[
            {
              text: "Delete",
              role: "destructive",
              icon: trash,
              handler: () => {
                if (photoToDelete) {
                  deletePhoto(photoToDelete);
                  setPhotoToDelete(undefined);
                }
              },
            },
            {
              text: "Cancel",
              icon: close,
              role: "cancel",
            },
          ]}
          onDidDismiss={handleCancel}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
type PhotosProps = {
  photo: UserPhoto;
  onClick: (photo: UserPhoto) => void;
};
const Photos = ({ photo, onClick }: PhotosProps) => {
  const handleClick = useCallback(() => onClick(photo), [photo, onClick]);
  return (
    <IonCol size="6">
      <IonImg src={photo.webviewPath} onClick={handleClick} />
    </IonCol>
  );
};
