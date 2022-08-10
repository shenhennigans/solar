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

### getPoint
params:
- angle (integer) - the sun hour angle from solarData or hra
- radius (integer) - the radius of the circle representing the sunpath
- centerX (integer) - the x coordinate of the center of the circle
- centerY (integer) - the y coordinate of the center of the circle

returns:
- object with the x and y coordinates of the given sun angle in a canvas

this can be used to translate sun angles and display sun location(s), sun path, sunrise/set horizon on a canvas

**example**

given a canvas with 500px width & height, we can represent the sun's position for a given location on a circle.

The center of the cirlce is the point of view of the observer.

On the X axis, 0 represents West and 500 represents East. The sun moves east to west, left to right on the screen.
The Y axis represents the height of the sun from the observers perspective. The smaller the number, the higher the sun.

```
//Chicago
let sd = solar.solarData(date, latitude, longitude, timezone); // create the object containing solardata

let centerX = 250;
let centerY = 250; // placing the circle in the center of the 500px square canvas


let radius = 150; // => the width & height of the circle representing the sun path will 300px and fit inside the 500px square canvas

let sunCoords = solar.getPoint(sd.hraNow, radius, centerX, centerY); // coordinates of the sun now 

let riseCoords = solar.getPoint(sd.hraSunrise, radius, centerX, centerY); // sunrise coordinates
let solarnoonCoords = solar.getPoint(sd.hraSolarNoon, radius, centerX, centerY); // noon coordinates
let setCoords = solar.getPoint(sd.hraSunset, radius, centerX, centerY); // sunset coordinates

console.log('X: '+riseCoords.x+' Y: '+riseCoords.y) // => X: 399.8843554361084 Y: 255.8889723638603
console.log('X: '+solarnoonCoords.x+' Y: '+solarnoonCoords.y) // => X: 207.39769829441167 Y: 106.17703976977103
console.log('X: '+setCoords.x+' Y: '+setCoords.y) // => X: 119.44664560901504 Y: 323.86353401552003
```

Between sunrise and sunset, the sun moves from east to west on the X axis (399 > 207 > 119). It also rises and falls on the Y axis (255 > 106 > 323).

To render the path of the sun, you can create a start and end datetime, iterate over moments in between and create a point for each:
```
let sunpath = [];

let dStart = moment.utc(moment.utc().year(), moment.utc().month(), moment.utc().date(), 0, 0]); // sunpath starts at midnight
let dEnd = dStart.clone().add(1, 'days'); // sun path end date is 24 hrs from start date

while (dStart < dEnd){
    sunpath.push(solar.getPoint(solar.hra(dStart,longitude, timezone), radius, centerX, centerY));
    dStart.add(1, 'minutes');
}
```

You can also render a "horizon" (the line between sunrise, the observer, and sunset) by creating a point for each:
```
let sd = solar.solarData(date, latitude, longitude, timezone); // create the object containing solardata

let riseCoords = solar.getPoint(sd.hraSunrise, radius, centerX, centerY); // point for sunrise
let observerCoords = {x : centerX, y : centerY};
let setCoords = solar.getPoint(sd.hraSunset, radius, centerX, centerY); // point for sunset
```

![sunposition](/img/sunposition.png "Rendering Sun Position")



