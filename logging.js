
import fs from "fs"
import chalk from 'chalk';
chalk.level = 3;
class logclass {
    //Internal Data
    #requiresnewline

    //displayatleastlevels: 1 - standardlog ; 2 - Warnings ; 3 - Errors

    //displayatleastlevel = 2 -> Displays Warnings and Errors (Standardlogs only gets saved in logfile)
    constructor({ nodisplay = false, addcallerlocation = false, displayatleastlevel = 1 } = {}) {
        //FileStreamData
        this.logs = {
            "active": false,
            "writestream": null,
            "filename": null,
        }
        //Settings
        this.settings =
        {
            "nodisplay": nodisplay,
            "displayatleastlevel":displayatleastlevel,
            "addcallerlocation": addcallerlocation,
            
        }
        this.#requiresnewline = (typeof process.env.PM2_HOME == "undefined" || typeof process.env.PM2_VERSION == "undefined" ) ? true : false;
    }

    /**
     * Set the settings
     *
     * @param {object} options { nodisplay = true, addcallerlocation = true }
     * @return {void}
     */
    set_settings({ nodisplay = null, addcallerlocation = null } = {}) {
        if (nodisplay !== null) {
            this.settings.nodisplay = nodisplay;
        }
        if (addcallerlocation !== null) {
            this.settings.addcallerlocation = addcallerlocation;
        }
    }

    /**
     * Activates the writestream
     *
     * @param {string} folderpath path to the folder where the log is saved (from root)
     * @param {string} filename Filename for the log. f.e. mylog.txt or bestlog.log
     * @return {object} writestream
     */
    activatestream(folderpath = `${__dirname}/log/`, filename = null) {
        return new Promise(async (resolve, reject) => {
            await checkforexistingfolder(folderpath)
                .then(async answer => {
                    try {
                        if (filename == null) {
                            let date = currenttime();
                            this.logs.filename = date.year + date.month + date.day + "-" + date.hour + date.min + date.sec + ".log";
                        }
                        else {
                            this.logs.filename = filename;
                        }
                        this.logs.writestream = fs.createWriteStream(folderpath + this.logs.filename, { flags: 'a' })
                        this.logs.active = true;
                        this.addlog(`WriteStream activated to log-file: ${this.logs.filename}`);
                        resolve(this.logs.writestream);
                    }
                    catch (error) {
                        console.log(`Error opening Stream: ${error}`)
                    }
                })
                .catch(function (error) {
                    console.log(`Error checking folder: ${error}`);
                });
        });
    }


    /**
     * Adds an log
     *
     * @param {string} message Message to put on the screen
     * @param {object} options F.e {color = "green",warn = "Status",level = 1}
     * @return {void} 
     */
    addlog(message, {
        color = null,
        warn = null,
        level = 1,
    } = {}) {

        let time = currenttime();

        var debugmsg = ""
        if (this.settings.addcallerlocation) {
            const stack = new Error().stack;
            const stackLines = stack.split("\n");
            const callerLine = stackLines[2];

            const match = callerLine.match(/([\/\\]([^\/\\]+\.js:\d+:\d+))/);

            if (match) {
                debugmsg = `${match[1].replace(/^.*[\/\\]/, '')} --- `
            }
        }

        var mainmessage = ""
        if ((color) && (warn) && level >= this.settings.displayatleastlevel) {
            mainmessage = chalk[color](`#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} [${warn}] => ${message}`);
        }
        else {
            mainmessage = `#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} => ${message}`
        }

        if (this.logs.active) {
            this.logs.writestream.write(debugmsg + `#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} => ${message}\n`)
        }

        if (this.#requiresnewline) {
            mainmessage = mainmessage + "\n"
        }

        if (!this.settings.nodisplay) {
            process.stdout.write(debugmsg + mainmessage)
        }

    }

}

var logvar = new logclass()
function mainlog(settings) {
    logvar.set_settings(settings)
    return logvar;
}

function currenttime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    let currenttime =
    {
        "hour": hour,
        "min": min,
        "sec": sec,
        "year": year,
        "month": month,
        "day": day
    }
    return currenttime;

}

function checkforexistingfolder(folderpath) {
    return new Promise((resolve, reject) => {
        fs.access(folderpath, err => {
            if (err && err.code === 'ENOENT') {
                fs.mkdir(folderpath, err => {
                    if (err) {
                        console.log(err);
                        reject("error");
                    }
                    else {
                        //console.log("Folder created!");
                        resolve(true);
                    }

                });
            }
            else {
                //console.log("Folder already existed!");
                resolve(true);
            }
        });

    });


}


export { logclass, mainlog }