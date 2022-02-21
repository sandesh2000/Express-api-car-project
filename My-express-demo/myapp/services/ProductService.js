const express = require('express')
var router = express.Router();
const oracledb = require('../../node_modules/oracledb');
const connectionProperties = {
    user: 'project',
    password: 'sandesh',
    connectString: 'localhost:1521/xe'
  }


//Get services or products list
router.route('/products/').get(function (request, response) {
    console.log("GET products");
    oracledb.getConnection(connectionProperties, function (err, connection) {
      if (err) {
        console.error(err.message);
        response.status(500).send("Error connecting to DB");
        return;
      }
      console.log("After connection");
      connection.execute("SELECT * FROM services",{},
        { outFormat: oracledb.OBJECT },
        function (err, result) {
          if (err) {
            console.error(err.message);
            response.status(500).send("Error getting data from DB");
            doRelease(connection);
            return;
          }
          console.log("RESULTSET:" + JSON.stringify(result));
          var services= [];
          result.rows.forEach(function (element) {
            services.push({ serviceid: element.SERVICEID, car: element.CAR, 
                         facility: element.FACILITY,price: element.PRICE});
          }, this);
          response.json(services);
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