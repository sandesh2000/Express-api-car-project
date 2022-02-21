const express = require('express')
var router = express.Router();
const oracledb = require('../../node_modules/oracledb');
const connectionProperties = {
    user: 'bajajpractice',
    password: 'sandesh',
    connectString: 'localhost:1521/xe'
  }

  /**
 * GET / 
 * Returns a list of employees 
 */
 router.route('/employees/').get(function (request, response) {
    console.log("GET EMPLOYEES");
    oracledb.getConnection(connectionProperties, function (err, connection) {
      if (err) {
        console.error(err.message);
        response.status(500).send("Error connecting to DB");
        return;
      }
      console.log("After connection");
      connection.execute("SELECT * FROM employee",{},
        { outFormat: oracledb.OBJECT },
        function (err, result) {
          if (err) {
            console.error(err.message);
            response.status(500).send("Error getting data from DB");
            doRelease(connection);
            return;
          }
          console.log("RESULTSET:" + JSON.stringify(result));
          var employees = [];
          result.rows.forEach(function (element) {
            employees.push({ id: element.ID, firstName: element.EMPNAME, 
                             salary: element.SALARY, pid: element.PID,
                              dept: element.DEPTID,address: element.ADDRESSID });
          }, this);
          response.json(employees);
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

  /**
 * POST / 
 * Saves a new employee 
 */
router.route('/employees/').post(function (request, response) {
    console.log("POST EMPLOYEE:");
    oracledb.getConnection(connectionProperties, function (err, connection) {
      if (err) {
        console.error(err.message);
        response.status(500).send("Error connecting to DB");
        return;
      }
  
      var body = request.body;
  
      connection.execute("INSERT INTO EMPLOYEE (ID,EMPNAME,SALARY,PID,DEPTID,ADDRESSID)"+ 
                         "VALUES(EMPLOYEE_SEQ.NEXTVAL, :empname,:salary,:pid,:deptid,:addressid)",
        [body.empname, body.salary, body.pid, body.deptid, body.addressid],
        function (err, result) {
          if (err) {
            console.error(err.message);
            response.status(500).send("Error saving employee to DB");
            doRelease(connection);
            return;
          }
          connection.execute('commit');
          response.status(200).send("Employee added.");
          doRelease(connection);
        });
    });
  });


  module.exports=router