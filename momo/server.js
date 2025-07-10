//demo payment momo by "collection link"
const { urlencoded } = require('body-parser');
const express = require('express');
const app = express();
const axios = require('axios');
const crypto = require('crypto');
const config = require('./config');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(express.static('./public'));

app.get('/payment', (req, res) => {
  res.send('Đây là trang GET /payment, bạn cần gửi POST để thanh toán');
});

app.get('/callback', (req, res) => {
  res.send('Đây là trang GET /callback, thường không dùng để truy cập trực tiếp');
});

app.post('/payment', async (req, res) => {
  let {
    accessKey,
    secretKey,
    partnerCode,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    orderGroupId,
    autoCapture,
    lang,
  } = config;

  const { amount, orderInfo, campaignId, campaignCreatorId, campaignTitle, userId, userName } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Thiếu số tiền thanh toán (amount).' });
  }

  const orderId = req.body.orderId;
  const requestId = orderId;

  const rawSignature =
    'accessKey=' + accessKey +
    '&amount=' + amount +
    '&extraData=' + extraData +
    '&ipnUrl=' + ipnUrl +
    '&orderId=' + orderId +
    '&orderInfo=' + orderInfo +
    '&partnerCode=' + partnerCode +
    '&redirectUrl=' + redirectUrl +
    '&requestId=' + requestId +
    '&requestType=' + requestType;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId,
    signature,
  };

  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    headers: {
      'Content-Type': 'application/json',
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);

    if (result.data && result.data.payUrl) {
      await firestore.collection('payments').add({
        campaignId,
        userId,
        userName,
        amount,
        paymentMethod: 'Momo',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        orderId,
        campaignCreatorId,
        campaignTitle,
      });
        const campaignRef = firestore.collection('featured_activities').doc(campaignId);
        await campaignRef.update({
          totalDonationAmount: admin.firestore.FieldValue.increment(Number(amount)),
        });

      return res.status(200).json(result.data);
    } else {
      return res.status(500).json({ message: 'Không tạo được liên kết thanh toán.' });
    }
  } catch (error) {
    console.error('Lỗi từ MoMo API:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Lỗi khi gọi API MoMo.', details: error.message });
  }
});

app.post('/callback', async (req, res) => {
  console.log('callback:', req.body);
  return res.status(200).json({ message: 'Callback received', data: req.body });
});

app.post('/check-status-transaction', async (req, res) => {
  const { orderId } = req.body;
  const { secretKey, accessKey, partnerCode } = config;

  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${orderId}`;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode,
    requestId: orderId,
    orderId,
    signature,
    lang: 'vi',
  };

  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/query',
    headers: {
      'Content-Type': 'application/json',
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Lỗi khi kiểm tra trạng thái giao dịch.' });
  }
});

app.listen(5000, () => {
  console.log('Server is running at port 5000');
});