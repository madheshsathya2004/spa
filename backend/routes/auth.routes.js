const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {authenthicateToken} = require('../middleware/auth.middleware');

const JWT_SECRET = 'your-secret-key-change-in-production';

//Register Route
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, role, password } = req.body;
    
        // Validation
        if (!fullName || !email || !password || !role) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please provide all required fields' 
          });
        }
    
        // Read current users
        const db = await req.app.locals.readDB();
    
        // Check if user already exists
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'User with this email already exists' 
          });
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let newUserId = 1;

        if(db.users.length > 0) {
            //Find the max id and add 1
            const maxId = Math.max(...db.users.map(u => parseInt(u.id)));
            newUserId = maxId + 1;
        }
    
        // Create new user
        const newUser = {
          id: newUserId,
          fullName,
          email,
          phone: phone || '',
          role,
          password: hashedPassword,
          createdAt: new Date().toISOString()
        };
    
        // Add user to database
        db.users.push(newUser);
        await req.app.locals.writeDB(db);
        
        /*
        // Generate JWT token
        const token = jwt.sign(
          { id: newUser.id, email: newUser.email, role: newUser.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        */
    
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = newUser;
    
        res.status(201).json({
          success: true,
          message: 'Registration successful',
          //token,
          user: userWithoutPassword
        });
    
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error during registration' 
        });
    }
});

//Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
    
        // Validation
        if (!email || !password) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please provide email and password' 
          });
        }
    
        // Read users
        const db = await req.app.locals.readDB();
    
        // Find user
        const user = db.users.find(u => u.email === email);
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }
    
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }
    
        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
    
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
    
        res.json({
          success: true,
          message: 'Login successful',
          token,
          user: userWithoutPassword
        });
    
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error during login' 
        });
    }
});

//User Profile

router.get('/profile', authenthicateToken, async (req, res) => {
    try {
    const db = await req.app.locals.readDB();
    console.log("inside profile verify");

    const user = db.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
       user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;