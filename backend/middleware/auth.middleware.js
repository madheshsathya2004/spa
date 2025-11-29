const jwt = require('jsonwebtoken')

const JWT_SECRET = 'your-secret-key-change-in-production';

//JWT Athentication
const authenthicateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
    
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Access token required' 
        });
      }
    
      jwt.verify(token, JWT_SECRET, (err, user) => {
        console.log("inside verifier");
        if (err) {
          return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
          });
        }
    
        req.user = user;
        console.log(req.user);
        next();
      });
}

module.exports = {authenthicateToken};