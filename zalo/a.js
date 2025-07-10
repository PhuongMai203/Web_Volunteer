// Node v10.15.3
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const qs = require('qs');

const app = express();

// APP INFO ZALOPAY SANDBOX
const config = {
  app_id: 554,
  key1: '8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn',
  key2: 'uUfsWgfLkRLzq6W2uNXTCxrfxs51auny',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
};

app.use(bodyParser.json());

// MIDDLEWARE VALIDATE APP_TRANS_ID
const validateAppTransId = (app_trans_id) => {
  const pattern = /^(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])_\d+$/;
  if (!pattern.test(app_trans_id)) return false;
  
  const clientDate = moment(app_trans_id.substring(0, 6), 'YYMMDD');
  const maxDate = moment().add(1, 'day');
  const minDate = moment().subtract(2, 'months');
  
  return clientDate.isBetween(minDate, maxDate, null, '[]');
};

/**
 * POST /payment - Tạo đơn hàng
 */
app.post('/payment', async (req, res) => {
  const { app_trans_id, app_user, amount, callback_url, description, bank_code } = req.body;

  // Validate input
  if (!app_trans_id || !validateAppTransId(app_trans_id)) {
    return res.status(400).json({
      return_code: 2,
      sub_return_code: -402,
      return_message: 'app_trans_id không hợp lệ'
    });
  }

  if (!app_user || !amount || !callback_url || !description) {
    return res.status(400).json({
      return_code: 2,
      sub_return_code: -401,
      return_message: 'Thiếu tham số bắt buộc'
    });
  }

  try {
    // Tạo order object
    const order = {
      app_id: config.app_id,
      app_trans_id,
      app_user,
      app_time: Date.now(),
      amount,
      item: '[]',
      embed_data: JSON.stringify({ redirecturl: callback_url }),
      description,
      callback_url,
      bank_code: bank_code || '',
    };

    // Tính MAC
    const rawData = [
      order.app_id,
      order.app_trans_id,
      order.app_user,
      order.amount,
      order.app_time,
      order.embed_data,
      order.item
    ].join('|');
    order.mac = CryptoJS.HmacSHA256(rawData, config.key1).toString();

    // Gọi ZaloPay API
    const response = await axios.post(config.endpoint, qs.stringify(order), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    res.json({
      return_code: 1,
      return_message: 'OK',
      order_url: response.data.order_url,
      zp_trans_id: response.data.zp_trans_id
    });

  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({
      return_code: 2,
      sub_return_code: -500,
      return_message: error.response?.data?.return_message || 'Lỗi hệ thống'
    });
  }
  console.log("Tạo đơn hàng với app_trans_id:", app_trans_id);

});

/**
 * POST /check-status-order - Kiểm tra trạng thái
 */
app.post('/check-status-order', async (req, res) => {
  const app_trans_id = req.body.app_trans_id;

  if (!app_trans_id || !validateAppTransId(app_trans_id)) {
    return res.status(400).json({
      return_code: 2,
      sub_return_code: -402,
      return_message: 'app_trans_id không hợp lệ'
    });
  }

  try {
    const postData = {
      app_id: config.app_id,
      app_trans_id
    };

    // Tính MAC cho truy vấn
    const rawQuery = [
      postData.app_id,
      postData.app_trans_id,
      config.key1
    ].join('|');
    postData.mac = CryptoJS.HmacSHA256(rawQuery, config.key1).toString();

    const response = await axios.post(
      'https://sb-openapi.zalopay.vn/v2/query',
      qs.stringify(postData),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json(response.data);

  } catch (error) {
    console.error('Query error:', error.response?.data || error.message);
    res.status(500).json({
      return_code: 2,
      sub_return_code: -500,
      return_message: 'Lỗi truy vấn trạng thái'
    });
  }
  console.log("Kiểm tra đơn hàng với app_trans_id:", app_trans_id);

});

// Khởi động server
app.listen(5000, () => {
  console.log('ZaloPay Payment Gateway running on port 5000');
  console.log('Test with app_trans_id format: YYMMDD_xxxxxx');
});