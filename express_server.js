const express = require("express");
const PORT = 8080;
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const getIdByEmail = function(email, userDatabase) {
  for (let user in userDatabase) {
    if (email === userDatabase[user].email) {
      return userDatabase[user].id;
    }
  }
  return false;
};

let passwordMatching = function(password, user) {
    if (bcrypt.compareSync(password, user.password)) {
      return true;
    }
  return false;
};


//returns a seperate object with all of the short url's associated to a specific user
const urlsForUser = function(id, urlDatabase) {
  const displayedUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      displayedUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return displayedUrls;
};

//Verifiying if url belongs to user
const urlBelongToUser = function(id, shortURL, urlDatabase) {
  if (urlDatabase[shortURL].userId === id) {
    return true;
  }
  return false;
};

//url database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "Jerry"},
  "9sm5xK": {longURL:"http://www.google.com", userId: "Cosmo"}
};

//user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//GET request for the homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello Word!'};
  res.render("hello_world", templateVars);
});

//GET route to main urls page
app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { urls: urlsForUser(user_id, urlDatabase), user: users[user_id] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); //prints random short url
  const longURL = req.body.longURL; //prints out full site name
  urlDatabase[shortURL] = {longURL, userId: req.cookies.user_id}; // url databse alone is short and long but urldb[shorturl] accesses long domain
  res.redirect(`/urls/${shortURL}`);

});

//to updated url via post route
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL; //updated/edited short url
  const longURL = req.body.longURL;
  let user_id = req.cookies.user_id;

  if (urlBelongToUser(user_id, shortURL, urlDatabase)) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Add new URL to database
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase, user: users[user_id] };
    res.render("urls_new",templateVars);
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user_id = req.cookies.user_id;

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

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  let user_id = req.cookies.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else if (urlBelongToUser(user_id, shortURL, urlDatabase)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let confirmedUser = getIdByEmail(req.body.email, users);
  if (confirmedUser) {
    if (passwordMatching(password, users[confirmedUser])) {
      res.cookie('user_id', confirmedUser);
      res.redirect("/urls");
    } else {
      res.status(403).send("Wrong Password.");
    }
  } else {
    res.status(403).send("Wrong Email.");
  }
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { user: users[user_id] };
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { user: users[user_id] };
  res.render("register", templateVars);
});

//endpoint to handle registration data
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send("Please fill out registration");
  }
  if (getIdByEmail(email, users)) {
    res.status(400).send("Email already exists");
  } else {
    const salt = bcrypt.genSaltSync(saltRounds);
    const userObj = { id, email, password: bcrypt.hashSync(password, salt)}
    users[id] = userObj;
    res.cookie('user_id', id);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
