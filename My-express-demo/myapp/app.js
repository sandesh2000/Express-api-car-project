const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser');

const oracledb = require('oracledb')
const config = {
  user: 'project',
  password: 'sandesh',
  connectString: 'localhost:1521/xe'
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));

var UserService=require('./services/RegisterUserService')
app.use(UserService)

var ProductService=require('./services/ProductService')
app.use(ProductService)

/*
const oracledb = require('oracledb')
const config = {
  user: 'bajajpractice',
  password: 'sandesh',
  connectString: 'localhost:1521/xe'
}
*/
//var router = express.Router();
// configure app to use bodyParser()
// this will let us get the data from a POST

//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json({ type: '*/*' }));

//var UserService=require('./services/EmployeeService')
//app.use(UserService)




app.use(express.static('public'))
app.use('/static', express.static('files'))
app.get('/', (req, res) => {
  res.send('Hello World this is me!')
})

app.post('/', function (req, res) {
  res.send('Got a POST request')
})

app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user')
})

app.delete('/cart/:id', function (req, res) {
  res.send('Got a DELETE request at /user' + req.params.id)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


async function getEmployee(empId) {
  let conn

  try {
    conn = await oracledb.getConnection(config)

    const result = await conn.execute(
      'select * from employee where id = :id',
      [empId]
    )
    if (result.rows[0] == undefined)
      console.log("Employee not found with id:" + empId)
    else
      console.log(result.rows[0])
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

//getEmployee(20)

