const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
      console.log("USER ROLE:", req.user.role)
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access forbidden: insufficient permissions"
      });
    }

    next();
  };
};

module.exports = authorizeRole;