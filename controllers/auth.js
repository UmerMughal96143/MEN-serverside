const User = require('../models/user');
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const sendGridMailer = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const user = require('../models/user');
const {validationResult} = require('express-validator/check')

const transporter = nodemailer.createTransport(
  sendGridMailer({
    auth: {
      api_key:
        "SG.n55Y9wsYQVmgyKIsQA-smg.GikszCgi6LyyKt3iC1rPyfUU3miYqhbO1GPsYsrYZ3g",
    },
  })
);


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];

  }else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage : message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage : message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email ;
  const password = req.body.password;

  console.log(req.body)

  User.findOne({email : email})
    .then((user) => {
      if(!user){
        req.flash('error' , 'Invalid Username or Password')
       return res.redirect('/login')
      }
      bcrypt.compare(password , user.password).then(
        doMatch => {
          if(doMatch){
             req.session.isLoggedIn = true;
             req.session.user = user;
             return req.session.save((err) => {
               console.log(err);
                res.redirect('/')
             });
          }
          res.redirect('/login')
        }
      ).catch(err => {
        console.log(err)
        res.redirect('/login')
      })
     
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array())
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
    });
  }

  User.findOne({email : email})
  .then(userDoc => {
    if(userDoc){

      return res.redirect('/signup')
    }
    return bcrypt
      .hash(password, 12)
      .then((hashPassword) => {
        const user = new User({
          email: email,
          password: hashPassword,
          cart: { items: [] },
        });

        return user.save();
      })
      .then((result) => {
        res.redirect("/login");
        return transporter.sendMail({
          to : email ,
          from : 'itsmeumer96@gmail.com',
          subject : 'SignUp Succeed !',
          html : '<h1>Welcome to our shop ! You Successfully Signed Up !! </h1>'
        })
      }).catch(err => {
        console.log(err)
      })
    
  })
  .catch(err => {
    console.log(err) 
  })
 
 

};;

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};


exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};


exports.postReset = (req , res ,next ) => {
  crypto.randomBytes(32 , (err , buffer) => {
    if(err){
      console.log(err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex');
    User.findOne({email : req.body.email}).then(user => {
      if(!user){
        req.flash('error' , 'No account with this email found !')
        return res.redirect('/reset')
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000 ;
      user.save();
    }).then( reseult => {
      res.redirect('/')
        transporter.sendMail({
          to: req.body.email,
          from: "itsmeumer96@gmail.com",
          subject: "Password reset",
          html: `<p>You requested a passwoed reset </p>
          <p> Click this <a href = 'http://localhost:3000/reset/${token}'>link </a> to set a new password 

          `,
        });
    }

    ).catch(err => {
      console.log(err)
    })
  })

}


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
