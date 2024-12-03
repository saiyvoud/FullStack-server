import mysql from "mysql";

// const connected = mysql.createConnection({
//   host: "mysql-187129-0.cloudclusters.net",
//   port: "10026",
//   user: "admin",
//   password: "xEnr0gqI",
//   database: "db_restaurant",
// });
const connected = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_restaurant",
})
connected.connect((err) => {
  if (err) console.log(`Faild Connected Database` + err);
  console.log(`Connected Database`);
});

export default connected;
