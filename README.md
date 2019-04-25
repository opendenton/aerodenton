# Aero Denton

Aero Denton is an air quality monitoring project for the city of Denton, Texas. This project aims to extract data from the air quality monitors placed around the state by the Texas Commission on Environmental Quality (TCEQ).

## Background

There are a number of research-grade air quality monitors provided by the TCEQ around the state of Texas and in larger metropolitan areas. This data is provided through an antiquated interface that does not allow for advanced processing or alternative usage of the data collected.

Example URL: [https://www.tceq.texas.gov/cgi-bin/compliance/monops/daily_summary.pl?first_look=no&select_date=user&user_month=3&user_day=24&user_year=2009&select_site=site|Denton%20Airport%20South%20C56/A163/X157|48_121_0034|56&time_format=24hr](https://www.tceq.texas.gov/cgi-bin/compliance/monops/daily_summary.pl?first_look=no&select_date=user&user_month=3&user_day=24&user_year=2009&select_site=site|Denton%20Airport%20South%20C56/A163/X157|48_121_0034|56&time_format=24hr&format=json)

Aero Denton exists to support in extracting that data through automated web crawlers and store in an external system for better reporting purposes and larger civic engagement.

The screenshot below shows a snapshot of data collected using this tool.

![Aero Denton debug console](https://github.com/OpenDenton/aerodenton/blob/master/aero-console.png?raw=true)
