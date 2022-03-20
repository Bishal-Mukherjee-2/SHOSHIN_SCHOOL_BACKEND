import piexif from "piexif-ts";

const removeExifData = function (binaryPictureData: any) {
  try {
    return piexif.remove(binaryPictureData);
  } catch (err) {
    console.log("Error while removing EXIF data: ", err);
    return binaryPictureData;
  }
};

export default { removeExifData };
