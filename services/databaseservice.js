const bcrypt = require("bcrypt");
const { response } = require("express");

const { User } = require("../middleware/databaseconnection.js");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
async function signupService(data) {
  let encryptedPassword = bcrypt.hashSync(data.password, 10);

  let response;

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    emailId: data.emailId,
    password: encryptedPassword,
    role: data.role,
    publicKey: data.publicKey,
    privateKey: data.privateKey,
    accountId: data.accountId,
  })
    .then(function (item) {
      const token = jwt.sign(
        { user_id: item.id, email: item.emailId },
        process.env.JWT_TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      item.update({
        token: token,
      });

      // item.token = token;
      response = {
        message: "Item Created",
        status: 200,
        token: token,
      };
    })
    .catch((error) => {
      console.log("FROM ERROR");
      console.log(error);

      response = { message: error, status: 501 };
    });

  // console.log(await response);
  return await response;
}

async function loginService(emailId, password) {
  let user = await User.findOne({
    where: {
      emailId: emailId,
    },
  });
  if (!user) return false;

  bcrypt.compare(password, user.password, function (err, res) {
    if (err) {
      console.log(err);
    }
    if (res) {
      return true;
    } else {
      // response is OutgoingMessage object that server response http request
      return false;
    }
  });
}

async function searchService(query, queryType) {
  let queryOn = "";
  let data;
  if (queryType == 0) {
    data = await User.findAll({
      where: {
        emailId: {
          [Op.like]: `%${query}%`,
        },
      },
    });
  } else if (queryType == 1) {
    data = await User.findAll({
      where: {
        firstName: {
          [Op.like]: `%${query}%`,
        },
      },
    });
  } else {
    data = await User.findAll({
      where: {
        lastName: {
          [Op.like]: `%${query}%`,
        },
      },
    });
  }
  // console.log("INSIDE SEARCH");

  return data;
}

module.exports = {
  signupService,
  loginService,
  searchService,
};
