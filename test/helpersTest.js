const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

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