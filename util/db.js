/**
 * Database utilities.
 */

const sqlite3 = require("sqlite3").verbose();
const tableName = "sensors";
const tableCols =
  "timestamp site_id noy no no2 ox_ni ozone wind_spd res_wind_spd red_wind_dir max_wind_gust std_dev_wind_dir temp dew_point_temp rel_h solar_rad precip pm25";

// open the database
let db = new sqlite3.Database("./db/tceq.db", err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the TCEQ database.");
});

// Create base table
db.run(`CREATE TABLE ${tableName}(${tableCols})`);

// db.serialize(() => {
//   db.each(
//     `SELECT PlaylistId as id,
//                     Name as name
//              FROM playlists`,
//     (err, row) => {
//       if (err) {
//         console.error(err.message);
//       }
//       console.log(row.id + "\t" + row.name);
//     }
//   );
// });

// db.close(err => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log("Close the database connection.");
// });

class dbo {
  prepareRow(obj) {}

  insertRow(obj, table) {
    let cols = [];
    let vals = [];
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const el = object[key];
        cols.push(key);
        vals.push(el);
      }
    }
    return `INSERT INTO '${table}' (${cols.join(",")}) VALUES (${vals.join(
      ","
    )});`;
  }
}

// Export db object and actions.
module.exports.db = db;
module.exports.dbo = dbo;
