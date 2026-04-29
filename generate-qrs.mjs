import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const generateQRs = async () => {
  const regularUri = "upi://pay?pa=8838571152@okbizaxis&pn=Storyseedsstudio&am=599&cu=INR";
  const discountedUri = "upi://pay?pa=8838571152@okbizaxis&pn=Storyseedsstudio&am=299&cu=INR";
  
  const publicDir = path.resolve('public');
  
  await QRCode.toFile(path.join(publicDir, 'qr-regular.png'), regularUri, {
    color: {
      dark: '#0f172a',  // UNAI Tech Navy
      light: '#ffffff' // Transparent background
    },
    width: 400,
    margin: 2
  });

  await QRCode.toFile(path.join(publicDir, 'qr-discounted.png'), discountedUri, {
    color: {
      dark: '#2563eb',  // UNAI Tech Blue
      light: '#ffffff'
    },
    width: 400,
    margin: 2
  });
  
  console.log("QR codes generated successfully!");
};

generateQRs().catch(console.error);
