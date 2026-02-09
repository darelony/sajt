const db = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../services/token.service");


exports.login = (req, res) => {
  console.log("📂 DB FILE:", db.filename);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email i lozinka su obavezni" });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        console.error("❌ DB ERROR:", err.message);
        return res.status(500).json({ message: "Greška na serveru" });
      }

      if (!user) {
        console.log("❌ USER NOT FOUND:", email);
        return res.status(401).json({ message: "Pogrešan email ili lozinka" });
      }

 
      console.log("📧 EMAIL:", email);
      console.log("🔑 PASSWORD FROM FORM:", password);
      console.log("🔒 HASH FROM DB:", user.password);

      let isMatch = false;
      try {
        isMatch = await comparePassword(password, user.password);
      } catch (e) {
        console.error("❌ BCRYPT ERROR:", e.message);
        return res.status(500).json({ message: "Greška pri proveri lozinke" });
      }

      console.log("✅ BCRYPT MATCH:", isMatch);

      if (!isMatch) {
        return res.status(401).json({ message: "Pogrešan email ili lozinka" });
      }

      const token = generateToken({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      });

      return res.json({
        token,
        user: {
          id: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
};


exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      index_no,
      major,
      year,
    } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: "Nedostaju obavezna polja" });
    }

    const hashedPassword = await hashPassword(password);

    const sql = `
      INSERT INTO users
      (first_name, last_name, email, password, role, index_no, major, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        role,
        index_no || null,
        major || null,
        year || null,
      ],
      function (err) {
        if (err) {
          console.error("❌ REGISTER ERROR:", err.message);
          return res.status(500).json({ message: "Greška pri registraciji" });
        }

        return res.status(201).json({
          message: "Korisnik uspešno kreiran",
          user_id: this.lastID,
        });
      }
    );
  } catch (err) {
    console.error("❌ REGISTER TRY/CATCH ERROR:", err.message);
    return res.status(500).json({ message: "Greška na serveru" });
  }
};
const crypto = require("crypto");


exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email je obavezan" });
  }

  db.get(
    "SELECT user_id, email, first_name FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) {
        console.error("Greška pri traženju korisnika:", err);
        return res.status(500).json({ error: err.message });
      }

   
      if (!user) {
        return res.json({ 
          message: "If that email exists, a reset link has been sent." 
        });
      }

      
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; 

      
      db.run(
        `UPDATE users 
         SET reset_token = ?, reset_token_expiry = ? 
         WHERE user_id = ?`,
        [resetToken, resetTokenExpiry, user.user_id],
        function (err) {
          if (err) {
            console.error("Greška pri čuvanju tokena:", err);
            return res.status(500).json({ error: err.message });
          }

         
          console.log("=== RESET TOKEN ===");
          console.log(`Reset link: http://localhost:3000/reset-password/${resetToken}`);
          console.log("==================");

          res.json({ 
            message: "If that email exists, a reset link has been sent.",
            
            resetToken: resetToken 
          });
        }
      );
    }
  );
};


exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token i nova lozinka su obavezni" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Lozinka mora imati najmanje 6 karaktera" });
  }

  
  db.get(
    `SELECT user_id, email, reset_token_expiry 
     FROM users 
     WHERE reset_token = ?`,
    [token],
    async (err, user) => {
      if (err) {
        console.error("Greška pri traženju tokena:", err);
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      
      if (Date.now() > user.reset_token_expiry) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      try {
        
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        db.run(
          `UPDATE users 
           SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
           WHERE user_id = ?`,
          [hashedPassword, user.user_id],
          function (err) {
            if (err) {
              console.error("Greška pri ažuriranju lozinke:", err);
              return res.status(500).json({ error: err.message });
            }

            res.json({ message: "Password successfully reset. You can now log in." });
          }
        );
      } catch (error) {
        console.error("Greška pri hash-ovanju lozinke:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );
};