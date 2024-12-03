

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // URL de connexion à MongoDB
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017";

    // Connexion à la base de données
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Quitter le processus en cas d'erreur
  }
};

module.exports = connectDB;