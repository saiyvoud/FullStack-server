import mysql from "mysql";

const connected = mysql.createConnection({
  host: "mysql-187129-0.cloudclusters.net",
  port: "10026",
  user: "admin",
  password: "xEnr0gqI",
  database: "db_restaurant",
});
// const connected = mysql.createConnection({
//   host: "sql12.freesqldatabase.com",
//  // port: "10059",
//   user: "sql12743585",
//   password: "xk95InDQNk",
//   database: "sql12743585",
// })
connected.connect((err) => {
  if (err) console.log(`Faild Connected Database` + err);
  console.log(`Connected Database`);
});

export default connected;
