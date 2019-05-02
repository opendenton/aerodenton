#!/usr/bin/python3

from pprint import pprint
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import json
import requests
import pytz
import os
from influxdb import InfluxDBClient
from dotenv import load_dotenv
load_dotenv()


class TCEQ:
    # Setting local TZ because all TCEQ monitors are in Texas.
    local_tz = pytz.timezone('America/Chicago')
    url = "https://www.tceq.texas.gov/cgi-bin/compliance/monops/daily_summary.pl"
    site = 56  # Denton Airport South

    def remove_attrs(self, soup):
        for tag in soup.findAll(True):
            tag.attrs = None
        return soup

    def daterange(self, start_date, end_date):
        for n in range(int((end_date - start_date).days)):
            yield start_date + timedelta(n)

    def get_options(self, format=None):
        opts = []
        resp = requests.get(self.url)
        soup = BeautifulSoup(resp.text, 'html.parser')
        options = soup.find('select', {"name": "select_site"})
        for option in options.find_all('option'):
            value = option.attrs['value']
            if value.startswith('site'):
                opts.append(value)

        if format == 'json':
            tmp = []
            for val in opts:
                obj = {"desc": "", "aqs": "", "cas": ""}
                for i, v in enumerate(val.split('|')):
                    if i == 1:
                        obj.update({"desc": v})
                    if i == 2:
                        obj.update({"aqs": v})
                    if i == 3:
                        obj.update({"cas": v})
                tmp.append(obj)
            return tmp

        # Else, return strings.
        return opts

    def get_html(self, timestamp=None):

        # Give default timestamp
        if timestamp == None:
            timestamp = datetime.now().astimezone(tz=self.local_tz).timestamp()

        # Generate date
        date = datetime.fromtimestamp(timestamp).astimezone(tz=self.local_tz)

        # Prepare JSON
        params = {
            'select_date': "user",
            'user_month': date.month - 1,  # TCEQ has a weird offset.
            'user_day': date.day,
            'user_year': date.year,
            'select_site': "|||" + str(self.site),
            'time_format': "24hr"
        }

        return requests.get(self.url, params=params).text

    def get_table(self, timestamp=None):
        html = BeautifulSoup(self.get_html(timestamp=timestamp), 'html.parser')
        # Clean table attrs.
        html = self.remove_attrs(html)
        tables = pd.read_html(html.prettify(), header=0)
        data = tables[-1]
        return data

    def get_json(self, timestamp=None):
        data = self.get_table(timestamp=timestamp)
        data = data.rename(columns={"Parameter Measured": "measurement"}).iloc[:-3, 0:25]
        return data.to_json(orient="records")

    # @todo add support for site id
    def jsonbody_for_influx(self, data, timestamp):
        date = datetime.fromtimestamp(timestamp)
        items = []
        data = json.loads(data)
        for item in data:
            # Create initial object.
            obj = {"measurement": "", "time": "", "fields": {"value": None}}
            # Extract measurement name first.
            if item["measurement"]:
                m = item["measurement"].strip()
                obj.update({"measurement": m})

            # Loop through rest of the timestamps.
            for i in item:
                cObj = obj.copy()
                if item[i] is not None and self.isInteger(i) and self.isfloat(item[i]):  # Check if key is number.
                    value = float(item[i])
                    # pprint(value)
                    hour = int(i[0:2])  # Get hour
                    time = datetime(date.year, date.month, date.day, hour, 00).isoformat() + "Z"
                    cObj.update({"time": time, "fields": {"value": value}})
                    items.append(cObj)
        return items

    def isfloat(self, value):
        try:
            float(value)
            return True
        except ValueError:
            return False

    def isInteger(self, value):
        try:
            int(value)
            return True
        except ValueError:
            return False


tceq = TCEQ()
client = InfluxDBClient(host=os.getenv("INFLUXDB_HOST"), port=8086, username=os.getenv("INFLUXDB_USER"), password=os.getenv("INFLUXDB_PASSWORD"))
client.switch_database(os.getenv("INFLUXDB_DATABASE"))

ts = datetime.utcnow().timestamp()
data = tceq.get_json(timestamp=ts)
influx = tceq.jsonbody_for_influx(data=data, timestamp=ts)
pprint(influx)
#status = client.write_points(influx)
#pprint(status)
