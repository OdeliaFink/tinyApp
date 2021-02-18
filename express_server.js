const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, passwordMatching, urlsForUser, urlBelongToUser} = require('./helper');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKeys'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//url database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "Jerry"},
  "9sm5xK": {longURL:"http://www.google.com", userId: "Cosmo"}
};

//user database
const users = {};

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] };
  res.render("urls_login", templateVars);
});

//GET route to main urls page
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { urls: urlsForUser(user_id, urlDatabase), user: users[user_id] };
  res.render("urls_index", templateVars);
});

//Add new URL to database
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase, user: users[user_id] };
    res.render("urls_new",templateVars);
  }
});

//To show user their newly created link
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user_id = req.session.user_id;

  if (!user_id) {
    res.redirect("/login");
  } else if (urlsForUser(user_id, shortURL, urlDatabase)) {
    const templateVars = { shortURL, longURL, user: users[user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send("Not Authorized to View This Page.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello Word!'};
  res.render("hello_world", templateVars);
});

//GET request for the homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//endpoint to handle registration data
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send("Please fill out registration");
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("Email already exists");
  } else {
    const salt = bcrypt.genSaltSync(saltRounds);
    const userObj = { id, email, password: bcrypt.hashSync(password, salt)};
    users[id] = userObj;
    req.session['user_id'] = id;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let confirmedUser = getUserByEmail(email, users);
  if (confirmedUser) {
    if (passwordMatching(password, users[confirmedUser])) {
      req.session['user_id'] = confirmedUser;
      res.redirect("/urls");
    } else {
      res.status(403).send("Wrong Password.");
    }
  } else {
    res.status(403).send("Wrong Email.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); //prints random short url
  const longURL = req.body.longURL; //prints out full site name
  urlDatabase[shortURL] = {longURL, userId: req.session.user_id}; // url databse alone is short and long but urldb[shorturl] accesses long domain
  res.redirect(`/urls/${shortURL}`);

});

//to updated url via post route
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL; //updated/edited short url
  const longURL = req.body.longURL;
  let user_id = req.session.user_id;

  if (urlBelongToUser(user_id, shortURL, urlDatabase)) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  let user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else if (urlBelongToUser(user_id, shortURL, urlDatabase)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
