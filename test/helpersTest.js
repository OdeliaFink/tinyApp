const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helper.js');

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

const testUrlDatabase = {
  "bfjqot": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "randomUserId"
  },
  "htlams": {
    longUrl: "http://www.google.com",
    userID: "randomUserId"
  },
  "mjqcht": {
    longUrl: "http://www.zara.com",
    userID: "user2RandomID"
  }
};

describe('getUserByEmail', function() {
  it('it should return a user with a valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('it should return undefined for a user that does not have a valid email', function() {
    const user = getUserByEmail('user21@example.com', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

});

describe('generateRandomString', function() {

  it('should return a string with six characters', function() {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should not return the same string when called multiple times', function() {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe('urlsForUser', function() {

  it('should return an empty object if no urls exist for a given user ID', function() {
    const noSpecificUrls = urlsForUser("fakeUser", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(noSpecificUrls, expectedOutput);
  });
});