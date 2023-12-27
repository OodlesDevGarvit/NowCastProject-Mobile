import moment from "moment-timezone";

export const convertTime = (timeZone, date, time) => {
    let formattedDate, formattedTime;
    let startTime = `${date}` + " " + `${time}`;
    let newscheduleTime = moment.utc(startTime);
    var displayCutoff = newscheduleTime.clone().tz(timeZone);
    let formatDate = moment(displayCutoff).format('MM/DD/yyy, h:mm a');
    [formattedDate, formattedTime] = formatDate.split(',');
    return [formattedDate, formattedTime];
}

export const convertDate = (timeZone, date, time) => {
    let formattedDate, formattedTime;
    let startTime = `${date}` + " " + `${time}`;
    let newscheduleTime = moment.utc(startTime);
    var displayCutoff = newscheduleTime.clone().tz(timeZone);
    let formatDate = moment(displayCutoff).format('yyy-MM-DD, h:mm a');
    [formattedDate, formattedTime] = formatDate.split(',');
    return [formattedDate, formattedTime];
}