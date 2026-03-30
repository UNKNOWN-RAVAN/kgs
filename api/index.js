// api/index.js - Single file for all endpoints
import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const url = req.url;
  
  console.log('Request URL:', url);
  
  // Handle courses
  if (url === '/api/courses' || url === '/api/courses/') {
    return handleCourses(req, res);
  }
  
  // Handle subjects/123
  const subjectsMatch = url.match(/^\/api\/subjects\/(\d+)/);
  if (subjectsMatch) {
    const id = subjectsMatch[1];
    return handleSubjects(req, res, id);
  }
  
  // Handle lessons/123
  const lessonsMatch = url.match(/^\/api\/lessons\/(\d+)/);
  if (lessonsMatch) {
    const id = lessonsMatch[1];
    return handleLessons(req, res, id);
  }
  
  // Handle proxy POST
  if (req.method === 'POST' && url === '/api/proxy') {
    return handleProxy(req, res);
  }
  
  res.status(404).json({ error: 'Not found', url });
}

async function handleCourses(req, res) {
  try {
    const response = await fetch('https://spidykgs.vercel.app/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'courses', id: null })
    });
    
    const encrypted = await response.json();
    const bytes = CryptoJS.AES.decrypt(encrypted.payload, 'MySuperSecretKey2025');
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const courses = decrypted.courses || decrypted;
    const coursesArray = Array.isArray(courses) ? courses : Object.values(courses);
    
    res.status(200).json({
      success: true,
      count: coursesArray.length,
      courses: coursesArray
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function handleSubjects(req, res, id) {
  try {
    console.log('Fetching subjects for course:', id);
    
    const response = await fetch('https://spidykgs.vercel.app/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; V2052) AppleWebKit/537.36',
        'Origin': 'https://spidykgs.vercel.app',
        'Referer': 'https://spidykgs.vercel.app/',
        'X-Requested-With': 'idm.internet.download.manager'
      },
      body: JSON.stringify({ action: 'subjects', id: parseInt(id) })
    });
    
    const encryptedData = await response.json();
    
    if (!encryptedData.success || !encryptedData.payload) {
      throw new Error('Invalid response from API');
    }
    
    const bytes = CryptoJS.AES.decrypt(encryptedData.payload, 'MySuperSecretKey2025');
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    const decryptedData = JSON.parse(decryptedString);
    const subjects = Array.isArray(decryptedData) ? decryptedData : Object.values(decryptedData);
    
    res.status(200).json({
      success: true,
      courseId: parseInt(id),
      count: subjects.length,
      subjects: subjects
    });
    
  } catch (error) {
    console.error('Subjects error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

async function handleLessons(req, res, id) {
  try {
    console.log('Fetching lessons for subject:', id);
    
    const response = await fetch('https://spidykgs.vercel.app/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; V2052) AppleWebKit/537.36',
        'Origin': 'https://spidykgs.vercel.app',
        'Referer': 'https://spidykgs.vercel.app/',
        'X-Requested-With': 'idm.internet.download.manager'
      },
      body: JSON.stringify({ action: 'lessons', id: parseInt(id) })
    });
    
    const encryptedData = await response.json();
    
    if (!encryptedData.success || !encryptedData.payload) {
      throw new Error('Invalid response from API');
    }
    
    const bytes = CryptoJS.AES.decrypt(encryptedData.payload, 'MySuperSecretKey2025');
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    const decryptedData = JSON.parse(decryptedString);
    const lessons = Array.isArray(decryptedData) ? decryptedData : Object.values(decryptedData);
    
    res.status(200).json({
      success: true,
      subjectId: parseInt(id),
      count: lessons.length,
      lessons: lessons
    });
    
  } catch (error) {
    console.error('Lessons error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

async function handleProxy(req, res) {
  try {
    const { action, id } = req.body;
    const response = await fetch('https://spidykgs.vercel.app/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; V2052) AppleWebKit/537.36',
        'Origin': 'https://spidykgs.vercel.app',
        'Referer': 'https://spidykgs.vercel.app/',
        'X-Requested-With': 'idm.internet.download.manager'
      },
      body: JSON.stringify({ action, id: id || null })
    });
    
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}