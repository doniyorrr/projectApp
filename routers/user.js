const { Router } = require("express");
const multer = require('multer');
const dbUser = require("../model/user");
const bcryptjs = require('bcryptjs');
const path = require('path');
const passport = require("passport");
const router = Router();
// console.log(fetch)

const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "uploads");
  },
  filename: (req, file, cd) => {
    cd(null, Date.now() + path.extname(file.originalname));
    // cd(null, Math.random().toString.slice(-5) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cd) => {
    const ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&
      ext !== ".JPG" &&
      ext !== ".png" &&
      ext !== ".jpeg" &&
      ext !== ".jfif"
    ) {
      const err = new Error("xatolik bor");
      err.code = 404;
      return cd(err);
    }
    return cd(null, true);
  },
  preservePath: true,
}).single("photos");

router.get("/account/acc", (req, res) => {
  res.render("reg", {
    title: "Royhatdan otish",
  });
});


router.post("/account/acc", upload, (req, res) => {
  req.checkBody("name", "Ismingiz bosh qolishi mumkin emas").notEmpty();
  req.checkBody("username", "loginingizni bosh qolishi mumkin emas").notEmpty();
  req.checkBody("password", "password bosh qolishi mumkin emas").notEmpty();
  req
    .checkBody("password2", "passwordni qaytakiritish bosh qolishi mumkin emas")
    .notEmpty()
    .equals(req.body.password);
  req
    .checkBody("phone", "telefon raqamingizni bosh qolishi mumkin emas")
    .notEmpty();
  req
    .checkBody("email", "emailingizni kiriting bosh qolishi mumkin emas")
    .notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render("reg", {
      title: "Error",
      errors: errors,
    });
  } else {
    const db = new dbUser({
      name: req.body.name.toLowerCase(),
      username: req.body.username,
      password: req.body.password,
      phone: req.body.phone,
      email: req.body.email,
      photo: req.file.path,
    });
    bcryptjs.genSalt(10, (err, pass) => {
      bcryptjs.hash(db.password, pass, (err, hash) => {
        if (err) console.log(err);
        else {
          db.password = hash
          db.save((err) => {
            if (err) 
              throw err;
            else {
              req.flash("success", "Muvaffaqiyatli royhatdan otildi");
              res.redirect("/");
            }
          });
        }
      });
    });
  }
});

router.get("/login/log", (req, res) => {
  res.render("login", {
    title: "login",
  });
});


router.post("/login/log", (req, res , next) => {
  // console.log(req.body); 
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login/log",
      failureFlash: true ,
      successFlash: "xush kelibsiz ! tizimga kirdingiz",
    })(req, res, next);
});

router.get("/account/logout", (req, res) => {
  req.logout()
  req.flash("success" , "Tizimdan chiqdingiz")
  res.redirect("/")
});

module.exports = router;
