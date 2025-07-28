const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

/**
 * Route: Setup 2FA
 * Generates a new secret and QR code for a user
 */
app.post('/api/setup-2fa', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ success: false, message: 'Missing uid' });
  }

  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    const qrUrl = await QRCode.toDataURL(secret.otpauth_url);

    await db.collection('users').doc(uid).set({
      secret: secret.base32,
      secretUrl: qrUrl,
    }, { merge: true });

    res.json({ success: true, secret: secret.base32, secretUrl: qrUrl });
  } catch (error) {
    console.error('Error in /api/setup-2fa:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Route: Verify 2FA Token
 * Validates a user token from Google Authenticator
 */
app.post('/api/verify-2fa', async (req, res) => {
  const { uid, token } = req.body;
  if (!uid || !token) {
    return res.status(400).json({ success: false, message: 'Missing uid or token' });
  }

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = userDoc.data();
    const secret = userData.secret;
    if (!secret) {
      return res.status(400).json({ success: false, message: '2FA not set up' });
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (verified) {
      await db.collection('users').doc(uid).set({ twoFAEnabled: true }, { merge: true });
      res.json({ success: true, message: '2FA verification successful' });
    } else {
      res.json({ success: false, message: 'Invalid token' });
    }
  } catch (err) {
    console.error('Error in /api/verify-2fa:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on http://0.0.0.0:${PORT}`)
);
