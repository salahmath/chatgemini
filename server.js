const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Assurez-vous que Mongoose est installé
const Conversation = require('./model/model'); // Votre modèle Mongoose
const connectDB = require('./db'); // Connexion à la DB
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./model/user');
const { authMiddleware } = require('./wers/wers');
const app = express();
const port = 5000
// Connecter à la base de données
connectDB();
const JWT_SECRET = 'votre_secret'; // À remplacer par une valeur sécurisée
// Middleware
app.use(cors());
app.use(express.json());
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
})

app.post("/findUser",authMiddleware, async (req, res) => {
  const { id } = req.user;
  
  try {
    const user = await User.findById(id); // Fetch the user from the main collection

    // If one or both users are not found, handle accordingly
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json( user );
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
})
// Créer une conversation
app.post('/conversation', authMiddleware, async (req, res) => {
  const { _id: userId } = req.user; // `_id` de l'utilisateur récupéré depuis le middleware

  if (!userId) {
    return res.status(400).json({ error: "UserId manquant dans la requête" });
  }

  try {
    const newConversation = new Conversation({ userId, messages: [] });
    await newConversation.save();

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
  }
});

app.get('/conversation',authMiddleware, async (req, res) => {
 const {id}=req.user;

  try {
    const conversation =await Conversation.find({userId:id})
    const result = await Conversation.deleteMany({ messages: { $size: 0 } });

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Error creating conversation' });
  }
});
// Ajouter un message à une conversation
app.post('/conversation/:id/message', async (req, res) => {
  const { id } = req.params; // Conversation ID
  const { sender, text } = req.body;

  try {
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Ajouter le message à la conversation
    conversation.messages.push({ sender, text });
    await conversation.save();

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Error adding message to conversation' });
  }
});
app.get('/conversation/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation introuvable' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la conversation' });
  }
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
