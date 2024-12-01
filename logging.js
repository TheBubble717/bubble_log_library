
import fs from "fs"
import chalk from 'chalk';
import process from "process";

chalk.level = 3;

/**
* Class
*
* In Case of an crash process.emit('SIGINT'); must be emitted to make sure everything is saved!
* 
*/

class logclass {
    //Internal Data
    #requiresnewline
    #buffer_screen
    #buffer_file



    constructor({ nodisplay = false, addcallerlocation = false, screenLogLevel = 1, fileLogLevel = 1 } = {}) {
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
            "screenLogLevel": screenLogLevel, //screenLogLevels & fileLogLevel : log.addlog level need to be higher in order to get processed (f.e 3 = error and 1 = standard logs)
            "fileLogLevel": fileLogLevel,     //screenLogLevels & fileLogLevel : log.addlog level need to be higher in order to get processed (f.e 3 = error and 1 = standard logs)
            "addcallerlocation": addcallerlocation, //ignore screenLogLevel , don't write anything to screen

        }
        this.#requiresnewline = (typeof process.env.PM2_HOME == "undefined" || typeof process.env.PM2_VERSION == "undefined") ? true : false;
        this.#buffer_screen = [];
        this.#buffer_file = [];
        this.process_buffer()
    }

    /**
     * Set the settings
     *
     * @param {object} options { nodisplay = true, addcallerlocation = true }
     * @return {void}
     */
    set_settings({ nodisplay = null, screenLogLevel = null, fileLogLevel = null, addcallerlocation = null } = {}) {
        if (nodisplay !== null) {
            this.settings.nodisplay = nodisplay;
        }
        if (screenLogLevel !== null) {
            this.settings.screenLogLevel = screenLogLevel;
        }
        if (fileLogLevel !== null) {
            this.settings.fileLogLevel = fileLogLevel;
        }
        if (addcallerlocation !== null) {
            this.settings.addcallerlocation = addcallerlocation;
        }
    }

    async process_buffer() {
        const onExit = () => {
            flushBuffers();
        };

        const flushBuffers = () => {
            // Flush the file buffer if there is content to write
            if (this.#buffer_file.length) {
                this.logs.writestream.write(this.#buffer_file.join(''));
                this.#buffer_file = [];
            }

            // Flush the screen buffer if there is content to display
            if (this.#buffer_screen.length) {
                process.stdout.write(this.#buffer_screen.join(''));
                this.#buffer_screen = [];
            }
        };

        process.on('SIGINT', onExit);
        process.on('SIGTERM', onExit);


        do {
            flushBuffers();
            await new Promise(resolve => setTimeout(resolve, 100));
        } while (true);
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


        if (this.logs.active && level >= this.settings.fileLogLevel) {
            this.#buffer_file.push(debugmsg + `#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} => ${message}\n`)
        }

        if (!this.settings.nodisplay && level >= this.settings.screenLogLevel) {
            var mainmessage = ""
            if ((color) && (warn)) {
                mainmessage = chalk[color](`#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} [${warn}] => ${message}`);
            }
            else {
                mainmessage = `#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} => ${message}`
            }

            if (this.#requiresnewline) {
                mainmessage = mainmessage + "\n"
            }

            this.#buffer_screen.push(debugmsg + mainmessage)

        }
        return;


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