// a function that checks if the email already exists in users object
const getUserByEmail = function (email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId]; // Return the user object if the email is found
    }
  }
  return null; // Return null if the email is not found after checking all users
};

// a function that filters for URLS for the logged-in user
const urlsForUser = function (id) {
  const userUrls = {};
  for (const userUrl in urlDatabase) { 
    if (urlDatabase[userUrl].userID === id) { 
      userUrls[userUrl] = urlDatabase[userUrl];
    }
  }
  return userUrls;
};

// a function that returns a string of 6 random alphanumeric characters: 
function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    /* math.random * characters.length gives a random number, with math.floor making sure it's not a number with a decimal */
    const randomIndex = Math.floor(Math.random() * characters.length);
    /* populate empty '' with the .charAt the random number just produced in the characters string */
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
};