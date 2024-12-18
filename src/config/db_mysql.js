import mysql from "mysql";

const connected = mysql.createConnection({
  host: "mysql-189252-0.cloudclusters.net",
  port: "10034",
  user: "admin",
  password: "QZuCyO6Q",
  database: "db_restaurant",
});
// const connected = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "db_restaurant",
// })
connected.connect((err) => {
  if (err) console.log(`Faild Connected Database` + err);
  console.log(`Connected Database`);
});

export default connected;
