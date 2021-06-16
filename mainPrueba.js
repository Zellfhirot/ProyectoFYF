const mysql = require('mysql');
const express = require("express");




const listenPort = process.env.PORT || 8080;

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'cinesdb'
});
 
connection.connect();
 
process.on(`SIGINT`, () => {
  
connection.query('SELECT * FROM FYFdb', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 
connection.end();
process.exit(0);
  });


const server = express();

server.listen(listenPort, () =>
  console.log(`Server started listening on ${listenPort}`)
);