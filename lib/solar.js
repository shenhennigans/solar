import moment from 'moment-timezone';
export {getSolarData, hra}
const zenithRiseSet = 90.833;
const zenithDawnDusk = 96;
const K = Math.PI/180;

function getSolarData(date, latitude, longitude, timezone){
    let result = {}

    result.date = date;
    result.latitude = latitude;
    result.longitude = longitude;
    result.timezone = timezone;
    result.dawnLocal= getDawnDTLocal(date, latitude, longitude, timezone);
    result.sunriseLocal =getSunriseDTLocal(date, latitude, longitude, timezone);
    result.solarnoonLocal = getSolarNoonDTLocal(date, longitude, timezone);
    result.sunsetLocal = getSunsetDTLocal(date, latitude, longitude, timezone);
    result.duskLocal = getDuskDTLocal(date, latitude, longitude, timezone);
    result.solarmidnightLocal = getSolarMidnightLocal(date, longitude, timezone);
    result.dawnUTC = getDawnDTUTC(date, latitude, longitude, timezone);
    result.sunriseUTC = getSunriseDTUTC(date, latitude, longitude, timezone);
    result.solarnoonUTC = getSolarNoonDTUTC(date, longitude, timezone);
    result.sunsetUTC = getSunsetDTUTC(date, latitude, longitude, timezone);
    result.duskUTC = getDuskDTUTC(date, latitude, longitude, timezone);
    result.solarmidnightUTC = getSolarMidnightDTUTC(date, longitude, timezone);
    result.hraNow = hra(date, longitude, timezone);
    result.hraDawn = hra(result.dawnUTC, longitude, timezone);
    result.hraSunrise = hra(result.sunriseUTC, longitude, timezone);
    result.hraSolarNoon = hra(result.solarnoonUTC, longitude, timezone)
    result.hraSunset = hra(result.sunsetUTC, longitude, timezone);
    result.hraDusk = hra(result.duskUTC, longitude, timezone);
    result.hraSolarMidnight = hra(result.solarmidnightUTC, longitude, timezone);

    return result;
}

function getDawnDTLocal(date, latitude, longitude, timezone){
    let dawnMin = dawn(date, latitude, longitude, timezone);
    return makeTimeStampLocal(dawnMin, timezone, date); 
}

function getSunriseDTLocal(date, latitude, longitude, timezone){
    let sunriseMin = sunrise(date, latitude, longitude, timezone);
    return makeTimeStampLocal(sunriseMin, timezone, date); 
}

function getSolarNoonDTLocal(date, longitude, timezone){
    let solarnoonMin = solarNoon(date, longitude, timezone);
    return makeTimeStampLocal(solarnoonMin, timezone, date); 
}

function getSunsetDTLocal(date, latitude, longitude, timezone){
    let sunsetMin = sunset(date, latitude, longitude, timezone);
    return makeTimeStampLocal(sunsetMin, timezone, date); 
}

function getDuskDTLocal(date, latitude, longitude, timezone){
    let duskMin = dusk(date, latitude, longitude, timezone);
    return makeTimeStampLocal(duskMin, timezone, date); 
}

function getSolarMidnightLocal(date, longitude, timezone){
    let solarMidnightMin = solarMidnight(date, longitude, timezone);
    return makeTimeStamp(solarMidnightMin, timezone);
}

function getDawnDTUTC(date, latitude, longitude, timezone){
    let dawnMinUTC = dawnUTC(date, latitude, longitude, timezone);
    return makeTimeStamp(dawnMinUTC, timezone);
}

function getSunriseDTUTC(date, latitude, longitude, timezone){
    let sunriseMinUTC = sunriseUTC(date, latitude, longitude, timezone);
    return makeTimeStamp(sunriseMinUTC, timezone);
}

function getSolarNoonDTUTC(date, longitude, timezone){
    let solarnoonMinUTC = solarNoonUTC(date, longitude, timezone);
    return makeTimeStamp(solarnoonMinUTC, timezone);
}

function getSunsetDTUTC(date, latitude, longitude, timezone){
    let sunsetMinUTC = sunsetUTC(date, latitude, longitude, timezone);
    return makeTimeStamp(sunsetMinUTC, timezone);
}

function getDuskDTUTC(date, latitude, longitude, timezone){
    let duskMinUTC = duskUTC(date, latitude, longitude, timezone);
    return makeTimeStamp(duskMinUTC, timezone);
}

function getSolarMidnightDTUTC(date, longitude, timezone){
    let solarmidnightMinUTC = solarMidnightUTC(date, longitude, timezone);
    return makeTimeStamp(solarmidnightMinUTC, timezone);
}

function frYear(date){
    return (((2* Math.PI)/365)*((date.dayOfYear()-1)+((date.hour()-12)/24)));
}

function eqTime(date){
    return(229.18*(0.000075 + 0.001868*Math.cos(frYear(date)) - 0.032077*Math.sin(frYear(date)) - 0.014615*Math.cos(2*frYear(date)) - 0.040849*Math.sin(2*frYear(date))));
}

function declAngle(date){
    return ( 0.006918 - 0.399912*Math.cos(frYear(date)) + 0.070257*Math.sin(frYear(date)) - 0.006758*Math.cos(2*frYear(date)) + 0.000907*Math.sin(2*frYear(date)) - 0.002697*Math.cos(3*frYear(date)) + 0.00148*Math.sin(3*frYear(date)) )*180/Math.PI;
}

function timeZoneNum(date, timezone){
    return date.clone().tz(timezone).utcOffset()/60;
}

function localStandardTimeMeridian(date, timezone){
    return 15*Math.abs(timeZoneNum(date, timezone));
}

function timeCorrectionFactor(date, longitude, timezone){
    return (4*Math.abs(localStandardTimeMeridian(date, timezone) - longitude)) + eqTime(date);
}

function localSolarTime(date, longitude, timezone){
    let cfMinutes = Math.abs((timeCorrectionFactor(date, longitude, timezone) / 60));
    let lstDate = date.clone();
    
    if(timeCorrectionFactor(date, longitude, timezone) < 0){
        lstDate.subtract(cfMinutes, 'minutes');
    }
    else{
        lstDate.add(cfMinutes, 'minutes');
    }
    lstDate.tz(timezone);
    return (lstDate.hour()*60) + lstDate.minute();
}

function hra(date, longitude, timezone){
    return (localSolarTime(date, longitude, timezone) / 4) - 180;
}

function solarZenithAngle(date, latitude, longitude, timezone){
    let Phi = Math.sin(K*latitude)*Math.sin(K*declAngle(date))+Math.cos(K*latitude)*Math.cos(K*declAngle(date))*Math.cos(K*hra(date, longitude, timezone));
    Phi = Math.acos(Phi)/K;
    return Phi;
}

function solarAzimuth(date, latitude, longitude, timezone){
    let Theta = -(Math.sin(K*latitude)*Math.cos(K*solarZenithAngle(date))-Math.sin(K*declAngle(date)))/(Math.cos(K*latitude)*Math.sin(K*solarZenithAngle(date)));
    Theta = Math.acos(Theta)/K
    if(hra(date, longitude, timezone) < 0){
        return Theta;
    }
    else{
        return 360 - Theta;
    }
}

function solarElevationAngle(date, latitude, longitude, timezone){
    return Math.asin(
        (Math.sin(latitude) * Math.sin(declAngle(date))) +
        (Math.cos(latitude) * Math.cos(declAngle(date)) * Math.cos(hra(date, longitude, timezone)))
    );
}

function hourAngleRiseSet(date, latitude){
    let hars = Math.cos(K*zenithRiseSet)/(Math.cos(K*latitude)*Math.cos(K*declAngle(date))) - Math.tan(K*latitude)*Math.tan(K*declAngle(date));
    hars = Math.acos(hars)/K;
    return hars;
}

function hourAngleDawnDusk(date, latitude){
    let hadd = Math.cos(K*zenithDawnDusk)/(Math.cos(K*latitude)*Math.cos(K*declAngle(date))) - Math.tan(K*latitude)*Math.tan(K*declAngle(date));
    hadd = Math.acos(hadd)/K;
    return hadd;
}

function dawn(date, latitude, longitude, timezone){
    let dawn = 720-(4*(longitude+hourAngleDawnDusk(date, latitude))-eqTime(date));
    dawn = (dawn / 60) + timeZoneNum(date, timezone);
    return dawn;
}

function dawnUTC(date, latitude, longitude, timezone){
    return dawn(date, latitude, longitude, timezone) - timeZoneNum(date, timezone);
}

function sunrise(date, latitude, longitude, timezone){
    let sunrise = 720-(4*(longitude+hourAngleRiseSet(date, latitude))-eqTime(date)); // in min
    sunrise = (sunrise / 60) + timeZoneNum(date, timezone); // in hrs
    return sunrise;
}

function sunriseUTC(date, latitude, longitude, timezone){
    return sunrise(date, latitude, longitude, timezone) - timeZoneNum(date, timezone);
}

function solarNoon(date, longitude, timezone){
    let snoon = 720 - (4*longitude) - eqTime(date);
    snoon = (snoon/60) + timeZoneNum(date, timezone);
    return snoon;
}

function solarNoonUTC(date, longitude, timezone){
    return solarNoon(date, longitude, timezone) - timeZoneNum(date, timezone);
}

function sunset(date, latitude, longitude, timezone){
    let sunset = 720-(4*(longitude-hourAngleRiseSet(date, latitude))-eqTime(date)); // in min
    sunset = (sunset / 60) + timeZoneNum(date, timezone); // in hrs
    return sunset;
}

function sunsetUTC(date, latitude, longitude, timezone){
    return sunset(date, latitude, longitude, timezone) - timeZoneNum(date, timezone);
}

function dusk(date, latitude, longitude, timezone){
    let dusk = 720-(4*(longitude-hourAngleDawnDusk(date, latitude))-eqTime(date));
    dusk = (dusk / 60) + timeZoneNum(date, timezone);
    return dusk;
}

function duskUTC(date, latitude, longitude, timezone){
    return dusk(date, latitude, longitude, timezone) - timeZoneNum(date, timezone);
}

function solarMidnight(date, longitude, timezone){
    let smidnight = solarNoon(date, longitude, timezone) + 12;
    if(smidnight > 24){
        smidnight = smidnight - 24;
    }
    return smidnight;
}

function solarMidnightUTC(date, longitude, timezone){
    let smidnight = solarNoonUTC(date, longitude, timezone) + 12;
    if(smidnight > 24){
        smidnight = smidnight - 24;
    }
    return smidnight;
}

function daylight_length(date, latitude, longitude, timezone){
    return Math.abs(sunset(date, latitude, longitude, timezone) - sunrise(date, latitude, longitude, timezone)) / 36e5;
}

function makeTimeStamp(num, timezone){
    let dayModifier = 0;
    if(num < 0){
        num = 24 - Math.abs(num);
        dayModifier = -1;
    }
    else if(num > 24){
        num = num -24;
        dayModifier = 1;
    }
    let numStr = num.toString();
    let hrs;
    let mins;
    if(numStr.includes(".")){
        let timeArray = numStr.split(".");
        hrs = timeArray[0];
        mins = timeArray[1];
    }
    else{
        hrs = num;
        mins = '00'
    }
    hrs = zeroPad(hrs, 2);

    mins = mins.substring(0,2);
    if(mins.length < 2){
        zeroPadEnd(num, 2)
    }
    mins = parseInt(mins);
    mins = Math.round((mins * 60) / 100);
    mins = mins.toString()
    mins = zeroPad(mins, 2);
    
    let day = moment.tz(timezone).date();
    day = day + dayModifier;
    day = day.toString();
    day = zeroPad(day, 2);

    let month = moment.tz(timezone).month() + 1;
    month = month.toString();
    month = zeroPad(month, 2);

    let year = moment.tz(timezone).year();
    year = year.toString();
    
    let datetime = moment.utc(`${year}-${month}-${day} ${hrs}:${mins}`)
    return datetime;
}

function makeTimeStampLocal(num, timezone, date){
    let tzModifier = timeZoneNum(date, timezone);
    if(tzModifier < 0){
        num = num + Math.abs(tzModifier);
    }
    else{
        num = num - Math.abs(tzModifier);
    }
    let dayModifier = 0;
    if(num < 0){
        num = 24 - Math.abs(num);
        dayModifier = -1;
    }
    else if(num > 24){
        num = num -24;
        dayModifier = 1;
    }
    let numStr = num.toString();
    let hrs;
    let mins;
    if(numStr.includes(".")){
        let timeArray = numStr.split(".");
        hrs = timeArray[0];
        mins = timeArray[1];
    }
    else{
        hrs = num;
        mins = '00'
    }
    hrs = zeroPad(hrs, 2);

    mins = mins.substring(0,2);
    if(mins.length < 2){
        zeroPadEnd(num, 2)
    }
    mins = parseInt(mins);
    mins = Math.round((mins * 60) / 100);
    mins = mins.toString()
    mins = zeroPad(mins, 2);
    
    let day = moment.tz(timezone).date();
    day = day + dayModifier;
    day = day.toString();
    day = zeroPad(day, 2);

    let month = moment.tz(timezone).month() + 1;
    month = month.toString();
    month = zeroPad(month, 2);

    let year = moment.tz(timezone).year();
    year = year.toString();
    
    let datetime = moment.utc(`${year}-${month}-${day} ${hrs}:${mins}`).tz(timezone);
    return datetime;
}

function zeroPad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function zeroPadEnd(num, size){
    num = num.toString();
    while (num.length < size) num = num + "0";
    return num;
}