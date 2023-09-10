const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

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
}
// a function that checks if the email already exists in users object
const checkEmail = function (email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId]; // Return the user object if the email is found
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
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs"); // tells express app to use EJS as template 

app.use(cookieParser()); // tells express app to use cookie-parser

app.use(express.urlencoded({ extended: true })); /* needs to be before all routes; will convert buffer body into string */ 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;
  const userUrls = urlsForUser(userId);
  const templateVars = {
    user: users[userId], /* looks into the users object for the userId generated by the cookie */
    urls: userUrls
  };
  if (!userId) {
    res.render("login_prompt", templateVars); // Create a new EJS template for login prompt
    return;
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.userId) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[req.cookies["userId"]],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies.userId) { // If not logged in
    res.status(403).send("You must be logged in to shorten URLs");
  } else {
    // Generate a random id for the new URL
    const id = generateRandomString();
    // Get the longURL from the request body 
    const longURL = req.body.longURL;
    // Add the id-longURL pair to the urlDatabase
    urlDatabase[id] = { longURL: longURL, userID: req.cookies.userId };
    // Redirect to the page that displays the newly created URL
    res.redirect(`/urls/${id}`);
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id; //will show just shortened id
  const url = urlDatabase[id];
  if (!url) {
    res.status(404).send("URL not found"); 
    return;
  }
  const templateVars = { id: id, longURL: url.longURL,  user: users[req.cookies["userId"]]};
  if (!req.cookies.userId) {
    res.status(403).send("You must be logged in to view URLs");
    return;
  } 
  if (req.cookies.userId !== url.userID) {
    res.status(403).send("You do not have permission to view this URL");
    return;
  } 
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Get the id parameter from the URL
  const longURL = urlDatabase[id].longURL; // Retrieve the longURL from the urlDatabase
  if (longURL) {
    res.redirect(longURL); // Redirect to the longURL if it exists
  } else {
    res.status(404).send("URL not found"); // Handle the case where the id is not found in the database
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // Get the id parameter from the URL
  const url = urlDatabase[id];
  if (req.cookies.userId === url.userID) {
    delete urlDatabase[id]
    res.redirect("/urls")
  } else {
    res.status(403).send("You do not have permission to delete this URL");
  }
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id; // Get the id parameter from the URL
  const newLongURL = req.body.newLongURL; // Get the updated URL from the input
  const url = urlDatabase[id];
  if (req.cookies.userId === url.userID) {
    // Update the URL in urlDatabase using the id
    urlDatabase[id].longURL = newLongURL;
    res.redirect(`/urls`);
  } else {
    res.status(403).send("You do not have permission to edit this URL");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = checkEmail(email); // Check if the email exists in the users obj
  if (user === null) {
    res.status(403).send("Invalid email or password");
  } else if (user.password !== password) {
    res.status(403).send("Invalid email or password");
  } else {
    res.cookie("userId", user.id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.userId) {
    res.redirect("/urls");
    return; 
  }
  const templateVars = {
    user: users[req.cookies["userId"]], /* looks into the users object for that userId generated by the cookie */
    urls: urlDatabase
  };
  res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId") // Clear the "userId" cookie
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.cookies.userId) {
    res.redirect("/urls");
    return; 
  }
  const templateVars = {
    user: users[req.cookies["userId"]], /* looks into the users object for that userId generated by the cookie */
    urls: urlDatabase
  };
  res.render("register", templateVars); // Render the register.ejs template
});

app.post("/register", (req, res) => {
  const userId = generateRandomString(); // Generate a random userId
  const { email, password } = req.body; // Get the email and password
  // Check for empty email or password
  if (!email || !password) {
    return res.status(400).send("Enter valid email and password");
  } 
  // Check if the email is already in use
  if (checkEmail(email) !== null) {
      return res.status(400).send("Email already in use");
  } 
  // Add new user to global users object
  users[userId] = { 
    id: userId,
    email: email,
    password: password
  };
  res.cookie("userId", userId) // create a cookie with the userId
  console.log(users); // check to see if users object updated 
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
