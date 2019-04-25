const axios = require("axios");
const tabletojson = require("tabletojson");

// Base TCEQ URL
const tceqUrl =
  "https://www.tceq.texas.gov/cgi-bin/compliance/monops/daily_summary.pl";

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

// Crawl with Axios
axios
  .get(tceqUrl, {
    params: params
  })
  .then(function(res) {
    console.log(res);
    const converted = tabletojson.convert(res.data);
    console.log(converted);
  })
  .catch(function(error) {
    console.log(error);
  })
  .then(function() {
    // always executed
  });
