const axios = require("axios");
const tabletojson = require("tabletojson");
require("dotenv").load();

// Base TCEQ URL
const tceqUrl =
  "https://www.tceq.texas.gov/cgi-bin/compliance/monops/daily_summary.pl";
const jsonstore = "https://api.jsonbin.io/b";

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
    let data = converted.pop();
    let storage = {
      timestamp: timestamp,
      site_id: params.select_site.split("|").pop()
    };

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

    // Post to JSONstore
    let options = {
      method: "POST",
      data: storage,
      headers: {
        "Content-Type": "application/json",
        "secret-key": process.env["secret-key"],
        "collection-id": process.env["collection-id"],
        name: "tecq_" + timestamp,
        private: false
      },
      url: jsonstore
    };

    console.log(storage);

    axios(options)
      .then(res => {
        // console.log(res);
      })
      .catch(function(error) {
        // console.log(error);
      });
  })
  .catch(function(error) {
    // console.log(error);
  })
  .then(function() {
    // always executed
  });
