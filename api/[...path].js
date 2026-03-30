// api/[...path].js - Pure proxy that forwards everything to original backend
const axios = require('axios');

// Original backend URL (change this to the actual backend)
const BACKEND_URL = 'https://kgs-web.vercel.app';

// Store cookies for session persistence
let cookieJar = '';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sunny-Req, Cookie');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Get the full path from the request
    const path = req.query.path ? req.query.path.join('/') : '';
    const fullPath = `/api/${path}`;
    
    // Construct the target URL
    const targetUrl = `${BACKEND_URL}${fullPath}`;
    
    // Prepare headers - forward all relevant headers
    const headers = {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': req.headers['accept'] || 'application/json',
        'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
        'X-Sunny-Req': req.headers['x-sunny-req'] || 'sunny',
        'X-Requested-With': 'XMLHttpRequest',
    };
    
    // Forward cookies if we have them
    if (cookieJar) {
        headers['Cookie'] = cookieJar;
    }
    
    // Forward any other important headers
    if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
    }
    
    if (req.headers['authorization']) {
        headers['Authorization'] = req.headers['authorization'];
    }
    
    try {
        // Make the request to original backend
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: headers,
            data: req.method !== 'GET' ? req.body : undefined,
            params: req.query,
            validateStatus: () => true, // Don't throw on any status
            timeout: 30000 // 30 second timeout
        });
        
        // Store cookies from response for future requests
        if (response.headers['set-cookie']) {
            cookieJar = response.headers['set-cookie'].join('; ');
        }
        
        // Forward the response status
        res.status(response.status);
        
        // Forward all response headers
        Object.entries(response.headers).forEach(([key, value]) => {
            if (key !== 'content-encoding' && key !== 'transfer-encoding') {
                res.setHeader(key, value);
            }
        });
        
        // Send the response data
        res.send(response.data);
        
    } catch (error) {
        console.error('Proxy error:', error.message);
        
        // If it's a network error or timeout, return error
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            res.status(503).json({
                error: 'Backend service unavailable',
                message: 'Unable to reach the original server. Please try again later.'
            });
        } else {
            res.status(500).json({
                error: 'Proxy error',
                message: error.message
            });
        }
    }
};