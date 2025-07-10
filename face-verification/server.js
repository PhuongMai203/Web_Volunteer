const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const canvas = require("canvas");
const faceapi = require("@vladmandic/face-api");
const { cosineSimilarity } = require("./utils/similarity"); 

const app = express();
const port = 3000;

// Cấu hình multer để upload file
const upload = multer({ dest: "uploads/" });

// Khởi tạo face-api
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_PATH_SSD = "./models/ssd_mobilenetv1";
const MODEL_PATH_FACE_RECOG = "./models/face_recognition";
const MODEL_PATH_LANDMARK = "./models/face_landmark_68";


(async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH_SSD);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH_FACE_RECOG);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH_LANDMARK);
})();

// Hàm load ảnh và trích xuất face descriptor
async function getFaceDescriptor(filePath) {
  const img = await canvas.loadImage(filePath);
  const detections = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detections) return null;
  return detections.descriptor;
}

app.post("/verify-face", upload.fields([{ name: "id_card" }, { name: "selfie" }]), async (req, res) => {
  try {
    const idCardImage = req.files["id_card"][0].path;
    const selfieImage = req.files["selfie"][0].path;

    const descriptorIdCard = await getFaceDescriptor(idCardImage);
    const descriptorSelfie = await getFaceDescriptor(selfieImage);

    if (!descriptorIdCard || !descriptorSelfie) {
      // Xoá file nếu không dùng được
      fs.unlinkSync(idCardImage);
      fs.unlinkSync(selfieImage);
      return res.status(400).json({ error: "Không nhận diện được khuôn mặt" });
    }

    // ✅ Gán similarity trước khi dùng
    const similarity = cosineSimilarity(descriptorIdCard, descriptorSelfie);
    const isMatch = similarity > 0.6;

    // Xoá file tạm
    fs.unlinkSync(idCardImage);
    fs.unlinkSync(selfieImage);

    return res.json({ similarity, match: isMatch });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi xử lý" });
  }
});

app.listen(port, '0.0.0.0', () => { 
  console.log(`Server running on http://0.0.0.0:${port}`); 
 
});