const express = require("express");
const { createUser } = require("../controllers/utilizadorController");
const { login } = require("../controllers/authController");
const router = express.Router();

router.post("/utilizador", createUser);
router.post("/login", login);


module.exports = router;
