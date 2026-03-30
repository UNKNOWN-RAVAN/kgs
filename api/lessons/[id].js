// api/lessons/[id].js
import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Subject ID required' });
  }
  
  try {
    // Fetch lessons for specific subject
    const response = await fetch('https://spidykgs.vercel.app/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lessons', id: parseInt(id) })
    });
    
    const encrypted = await response.json();
    
    // Decrypt
    const bytes = CryptoJS.AES.decrypt(encrypted.payload, 'MySuperSecretKey2025');
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    const lessons = Array.isArray(decrypted) ? decrypted : Object.values(decrypted);
    
    res.status(200).json({
      success: true,
      subjectId: parseInt(id),
      count: lessons.length,
      lessons: lessons
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}