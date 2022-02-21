const express = require('express')
var router = express.Router();
const oracledb = require('../../node_modules/oracledb');
const connectionProperties = {
    user: 'project',
    password: 'sandesh',
    connectString: 'localhost:1521/xe'
  }

  router.route('/users/').get(function (request, response) {
    console.log("GET Customers");
    oracledb.getConnection(connectionProperties, function (err, connection) {
      if (err) {
        console.error(err.message);
        response.status(500).send("Error connecting to DB");
        return;
      }
      console.log("After connection");
      connection.execute("SELECT * FROM users",{},
        { outFormat: oracledb.OBJECT },
        function (err, result) {
          if (err) {
            console.error(err.message);
            response.status(500).send("Error getting data from DB");
            doRelease(connection);
            return;
          }
          console.log("RESULTSET:" + JSON.stringify(result));
          var users = [];
          result.rows.forEach(function (element) {
            users.push({ id: element.CUSTID, emailid: element.EMAILID, 
                             password: element.PASSWORD, name: element.NAME,
                              contact: element.CONTACT});
          }, this);
          response.json(users);
          doRelease(connection);
        });
    });
  });
  function doRelease(connection) {
    connection.release(function (err) {
      if (err) {
        console.error(err.message);
      }
    });
  }
  router.use(function (request, response, next) {
    console.log("REQUEST:" + request.method + "   " + request.url);
    console.log("BODY:" + JSON.stringify(request.body));
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });
  
//Saving new user:POST

  router.route('/register/').post(function (request, response) {
    console.log("POST USER:");
    oracledb.getConnection(connectionProperties, function (err, connection) {
      if (err) {
        console.error(err.message);
        response.status(500).send("Error connecting to DB");
        return;
      }
  
      var body = request.body;
  
      connection.execute("INSERT INTO users (CUSTID,EMAILID,PASSWORD,NAME,CONTACT)"+ 
                         "VALUES(CUSTID_SEQ.NEXTVAL, :emailid,:password,:name,:contact)",
        [body.emailid, body.password, body.name, body.contact],
        function (err, result) {
          if (err) {
            console.error(err.message);
            response.status(500).send("Error saving employee to DB");
            doRelease(connection);
            return;
          }
          connection.execute('commit');
          response.status(200).send("User added.");
          doRelease(connection);
        });
    });
  });

/**
 * POST / 
 *  employee login 
 */
 router.route('/login/').post(function (request, response) {
  console.log("POST login:");
  oracledb.getConnection(connectionProperties, function (err, connection) {
    if (err) {
      console.error(err.message);
      response.status(500).send("Error connecting to DB");
      return;
    }

    var body = request.body;
    console.log(body);
    console.log("After connection");
    connection.execute("SELECT * FROM USERS WHERE emailid=:emailid ", [body.emailid],
      { outFormat: oracledb.OBJECT },
      function (err, result) {
        if (err) {
          console.error(err.message);
          response.status(500).send("Error getting data from DB");
          doRelease(connection);
          return;
        }
        // console.log("RESULTSET:" + JSON.stringify(result));
        //console.log("User Password:"+body.password )
        var rowsProcessed = result.rows.length;

       // console.log("Fetched rows:" + rowsProcessed)
        //console.log("Fetched row data:" + JSON.stringify(result.rows[0]))

        if (rowsProcessed > 0) {
          var element = result.rows[0]
          var user = {
            custid: element.CUSTID, emailid: element.EMAILID,
            password: element.PASSWORD,name: element.NAME,contact: element.CONTACT
          };

        }

        // logic for auth

        if (rowsProcessed == 0) {
          response.status(400).send("User not found !")
        }
        else if (user.password == body.password) {
          user.password = "";
          response.status(200).send(user);
        }
        else {
          response.status(400).send("Wrong user credentials ! ")
        }

        doRelease(connection);

      });
  });
});

function doRelease(connection) {
    connection.release(function (err) {
      if (err) {
        console.error(err.message);
      }
    });
  }

  module.exports=router