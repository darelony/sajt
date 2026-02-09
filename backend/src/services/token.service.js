const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "12345";
const JWT_EXPIRES_IN = "1d";

exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user.user_id,
            role: user.role,
            email: user.email,
        },
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
    );
};

exports.verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};