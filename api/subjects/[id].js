// api/subjects/[id].js
import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Course ID required' });
  }
  
  try {
    // Fetch subjects for specific course
    const response = await fetch('https://spidykgs.vercel.app/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'subjects', id: parseInt(id) })
    });
    
    const encrypted = await response.json();
    
    // Decrypt
    const bytes = CryptoJS.AES.decrypt(encrypted.payload, 'MySuperSecretKey2025');
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    const subjects = Array.isArray(decrypted) ? decrypted : Object.values(decrypted);
    
    res.status(200).json({
      success: true,
      courseId: parseInt(id),
      count: subjects.length,
      subjects: subjects
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}