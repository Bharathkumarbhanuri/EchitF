const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/EchitF', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const db = mongoose.connection;
db.on('error', err => console.error('MongoDB Connection Error:', err));

// Middleware 
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serves static files from the 'public' folder

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Serve login page as the default page
app.get('/', (req, res) => {
  res.render('home'); // Render login.ejs from the views folder
});

app.get('/signup', (req, res) => {
  res.render('signup'); // This will look for views/signup.ejs
});

app.get('/login', (req, res) => {
  res.render('login', { error: null }); // This will look for views/signup.ejs
});

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.redirect('/login'); // Redirect to login after signup
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    // Redirect to home page after successful login
    res.redirect('/home');
  } catch (error) {
    return res.render('login', { error: 'Error logging in' });
  }
});

// Home route (after login)
app.get('/home', (req, res) => {
  // res.sendFile(__dirname + '/views/home.ejs');
  res.render('home');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));