
const jwt = require('jsonwebtoken');
const User = require('../model/user'); // Assurez-vous que le chemin est correct

const authMiddleware = async (req, res, next) => {
    let token;
  
    // Vérifiez si le token est dans l'en-tête Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]; // Extraire le token
  
      try {
        if (token) {
          // Vérifiez le token
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
          
          // Trouvez l'utilisateur correspondant au token
          const foundUser = await User.findById(decoded.id).select('-password'); // Exclure le mot de passe des données utilisateur
  
          // Vérifiez si un utilisateur est trouvé dans l'une des collections
          if (!foundUser ) {
            return res.status(404).json({ message: 'User not found' });
          }
  
          // Attachez l'utilisateur trouvé à req.user
          req.user = foundUser;
          next(); // Passez au prochain middleware ou contrôleur
        } else {
          res.status(401).json({ message: 'No token provided' });
        }
      } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      res.status(401).json({ message: 'Authorization header not provided' });
    }
  };
  
  module.exports = { authMiddleware };