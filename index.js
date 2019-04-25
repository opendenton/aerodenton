const axios = require("axios");
const tabletojson = require("tabletojson");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").load();

// INITIALIZATION
const tceqUrl =
  "https://www.tceq.texas.gov/cgi-bin/compliance/monops/daily_summary.pl";
// open the database
let db = new sqlite3.Database("./db/tceq.db", err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the TCEQ database.");
});
// Create base table
db.run(
  "CREATE TABLE sensors(timestamp site_id poc no no2 ozone wind_speed wind_dir wind_dir_std temp dew_point rel_h solar_rad prec pm25)"
);
///////////////////

// Parameters to supply
let params = {
  first_look: "no",
  select_date: "user",
  user_month: "3",
  user_day: "24",
  user_year: "2009",
  select_site: "site|Denton Airport South C56/A163/X157|48_121_0034|56",
  time_format: "24hr"
};

// Get timestamp
let modMonth = (parseInt(params.user_month) + 1).toString();
let month = modMonth.length == 1 ? "0" + modMonth : modMonth;
let timestamp = params.user_year + month + params.user_day;

// Crawl with Axios
axios
  .get(tceqUrl, {
    params: params
  })
  .then(function(res) {
    const converted = tabletojson.convert(res.data);
    // Always going to be the last table on the page (for now)
    let data = converted.pop();
    let storage = {
      timestamp: timestamp,
      site_id: params.select_site.split("|").pop()
    };

    /**
     * @todo use later
     */
    var date = new Date("2009-04-24 08:00:00").toLocaleString("en-US", {
      timeZone: "America/Chicago"
    });

    // Loop through rows in table.
    for (const item in data) {
      if (data.hasOwnProperty(item)) {
        const row = data[item];
        let tmp = {};

        // Slight hack to skip bad rows.
        if (!row.hasOwnProperty("Parameter Measured_4")) {
          continue;
        } else {
          delete row["Parameter Measured_4"];
        }

        // Get POC
        tmp["POC"] = row["POC_2"] ? row["POC_2"] : null;
        delete row["POC_2"];

        // Get parameter name
        tmp["parameter"] = row["Parameter Measured_3"];
        delete row["Parameter Measured_3"];

        // Get series data. We should only be down to timestamps now
        tmp["series"] = {};
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            const val = row[key];
            let k = key.split("_")[0];
            tmp["series"][k.toString()] = val;
          }
        }
        // Add result to storage.
        storage[tmp.parameter] = tmp;
      }
    }
    // WRITE TO DB
    //////////////
  })
  .catch(function(error) {
    // console.log(error);
  })
  .then(function() {
    // always executed
  });

db.serialize(() => {
  db.each(
    `SELECT PlaylistId as id,
                  Name as name
           FROM playlists`,
    (err, row) => {
      if (err) {
        console.error(err.message);
      }
      console.log(row.id + "\t" + row.name);
    }
  );
});

db.close(err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Close the database connection.");
});

function prepareRow(obj) {}

function insertRow(obj) {
  let cols = [];
  let vals = [];
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const el = object[key];
      cols.push(key);
      vals.push(el);
    }
  }
  let query =
    "INSERT INTO 'sensors' (" +
    cols.join(",") +
    ") VALUES (" +
    vals.join(",") +
    ");";

  return query;
}
