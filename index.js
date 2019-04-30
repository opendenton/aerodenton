const axios = require("axios");
const tabletojson = require("tabletojson");
const db = require("./util/db").db;
const dbo = require("./util/db").dbo;
const moment = require("moment");
const dotenv = require("dotenv");

// INITIALIZATION
const tceqUrl =
  "https://www.tceq.texas.gov/cgi-bin/compliance/monops/daily_summary.pl";
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

        // Delete POC
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
