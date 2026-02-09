const { verifyToken } = require("../services/token.service");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).json({message: "Nema tokena "});

    const token = authHeader.split(" ")[1];

    try{
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }catch (err){
        res.status(401).json({ message: "Ne vazi token"});
    }
}