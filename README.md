# solar-data
this library exposes methods to calculate the following time stamps (moment object) for a given date and location
- dawn (local and utc)
- sunrise (local and utc)
- solar noon (local and utc)
- sunset (local and utc)
- dusk (local and utc)
- solar midnight (local and utc)
as well as the sun hour angle (Integer) for a given date and location at
- current time
- dawn
- sunrise
- solar noon
- sunset
- dusk
- solar midnight

## use solar-data
[moment-timezone](https://www.npmjs.com/package/moment-timezone) is a dependency, import both into your project
```
import moment from "moment-timezone";
import * as solar from "solar-data";
```

## methods
### solarData
params: 
- date (a UTC date moment object)
- latitude (integer)
- longitude (integer)
- timezone (string, must be in the format of a [TZ database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones))

returns:
- result is an object containing solar data
    - parameters are written to the object
        - result.date
        - result.latitude
        - result.longitude
        - result.timezone
    - sun event dates in local and utc time
        - result.dawnLocal
        - result.sunriseLocal
        - result.solarnoonLocal
        - result.sunsetLocal
        - result.duskLocal
        - result.solarmidnightLocal
        - result.dawnUTC
        - result.sunriseUTC
        - result.solarnoonUTC
        - result.sunsetUTC
        - result.duskUTC 
        - result.solarmidnightUTC
    - sun hour angle currently and at sun event dates
        - result.hraNow
        - result.hraDawn
        - result.hraSunrise
        - result.hraSolarNoon
        - result.hraSunset
        - result.hraDusk
        - result.hraSolarMidnight

**example**

making the solardata object
```
let date = moment.utc(); // current datetime in UTC

let latitude = 41.85003;
let longitude = -87.65005; // lat/long for Chicago, IL

let timezone = "America/Chicago"; // timezone for Chicago, IL

let sd = solar.solarData(date, latitude, longitude, timezone); // create the object containing solardata
```

get solar event dates (dawn, sunset, etc.)
```
let sunrise = sd.sunriseLocal; //get sunrise timestamp in local time (Chicago), this is a moment object and can formatted accordingly

console.log(sunrise.format()); // => 2022-08-10T05:41:00-05:00
console.log(sunrise.format("HH:mm")); // => 05:41
console.log(sunrise.format("dddd, MMMM Do YYYY, hh:mm a")) // => Wednesday, August 10th 2022, 05:41 am
```

get sun hour angle
- this indicates the position of the sun in the sky on a scale of -180 to 180, corrected for earth tilt:
    - at lat: 0, long: 0, timezone: 'Etc/UCT' sunrise is -90, 0 is solar noon, 90 is sunset and 180/-180 is solar midnight
    - at other locations, these numbers are corrected for earth tilt
```
//Chicago

console.log(sd.hraSunrise) // => -92.25
console.log(sd.hraSolarNoon) // => 16.5
console.log(sd.hraSunset) // => 119.5
console.log(sd.hraSolarMidnight) // => -163.5

console.log(sd.hraNow) // => -74.25 => it is after sunrise but before noon


//Tokyo
console.log(sd.hraSunrise) // => -109
console.log(sd.hraSolarNoon) // => -3.25
console.log(sd.Sunset) // => 96.5
console.log(sd.hraSolarMidnight) // => 176.75

console.log(sd.hraNow) // => 146 => it is after sunset but before solar midnight
```

### hra
params:
- date (a UTC date moment object)
- longitude (integer)
- timezone (string, must be in the format of a [TZ database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones))

returns:
- integer of the solar hour angle at the passed date and location

**example**

```
let date = moment.utc('2001-1-1 00:00'); // Jan 1st 2001
let longitude = -0.12574; // longitude of London, UK
let timezone = 'Europe/London';

console.log(solar.hra(date, longitude, timezone)) // => 179.75 
```