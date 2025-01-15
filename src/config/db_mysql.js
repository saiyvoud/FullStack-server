import mysql from "mysql";

const connected = mysql.createPool({
  host: "mysql-190717-0.cloudclusters.net",
  port: "10087",
  user: "admin",
  password: "ikjShY2J",
  database: "db_restaurant",
  waitForConnections: true, // Wait for connections when the pool is full
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, 
});
// const connected = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "db_restaurant",
// })

connected.getConnection((err) => {
  if (err) console.log(`Faild Connected Database` + err);
  console.log(`Connected Database`);
});

export default connected;
