const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const getUserByEmail = function(email, userDatabase) {
  for (let user in userDatabase) {
    if (email === userDatabase[user].email) {
      return userDatabase[user].id;
    }
  }
  return false;
};

//comparing hashed passwords in syncronous function
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

module.exports = { generateRandomString, getUserByEmail, passwordMatching, urlsForUser, urlBelongToUser}