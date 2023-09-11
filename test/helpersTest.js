const { assert } = require('chai');

const { getUserByEmail, urlsForUser, generateRandomString } = require('../helpers.js');

const testUsers = {
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

const testDatabase = {
  "url1": { longURL: "http://example.com", userID: "userRandomID" },
  "url2": { longURL: "http://test.com", userID: "user2RandomID" },
};


// Tests for getUserByEmail function
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return null for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isNull(user);
  });
});

// Tests for urlsForUser function
describe('urlsForUser', function() {
  it('should return an object of URLs for a valid user ID', function() {
    const userId = "userRandomID";
    const userUrls = urlsForUser(userId, testDatabase);
    assert.isObject(userUrls);
  });

  it('should return an empty object for a non-existent user ID', function() {
    const userId = "nonexistentID";
    const userUrls = urlsForUser(userId, testDatabase);
    assert.isEmpty(userUrls);
  });
});

// Tests for generateRandomString function
describe('generateRandomString', function() {
  it('should return a string of the specified length', function() {
    const randomString = generateRandomString(6);
    assert.isString(randomString);
    assert.lengthOf(randomString, 6);
  });

  it('should return a different string with each call', function() {
    const randomString1 = generateRandomString(6);
    const randomString2 = generateRandomString(6);
    assert.notEqual(randomString1, randomString2);
  });
});