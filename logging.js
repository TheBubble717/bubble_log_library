
import fs from "fs"
import chalk from 'chalk';
chalk.level = 3;
class logclass {
    constructor({debug = false}= {}) {
        this.logs = {
            "active": false,
            "writestream": null,
            "filename": null,
            "debug":debug
        }
    }

    /**
     * Enable or disable debug mode (Writes the File and Line of the executing code in front of the output)
     *
     * @param {string} folderpath path to the folder where the log is saved (from root)
     * @param {string} filename Filename for the log. f.e. mylog.txt or bestlog.log
     * @return {object} writestream
     */
    set_debug({debug = false}= {})
    {
        this.logs.debug = debug
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
     * @param {object} otions F.e {color = "green",warn = "Status"}
     * @return {void} 
     */
    addlog(message, {
        color = null,
        warn = null
    } = {}) {
        let time = currenttime();

        //Add "Called from:"
        if (this.logs.debug) {
            const stack = new Error().stack;
            const stackLines = stack.split("\n");
            const callerLine = stackLines[2];

            const match = callerLine.match(/([\/\\]([^\/\\]+\.js:\d+:\d+))/);

            if (match) {
                var debugmsg = `${match[1].replace(/^.*[\/\\]/, '')} --- `
            }
        }

        if ((color) && (warn)) {
            if (this.logs.debug) {
                process.stdout.write(debugmsg)
            }
            process.stdout.write(chalk[color](`#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} [${warn}] => ${message}\n`));

        }
        else {
            if (this.logs.debug) {
                process.stdout.write(debugmsg)
            }
            process.stdout.write(`#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} => ${message}\n`);

        }
        if (this.logs.active) {
            this.logs.writestream.write(`#${time.year}-${time.month}-${time.day} ${time.hour}:${time.min}:${time.sec} => ${message} \n`)
        }
    }

}

var logvar = new logclass()
function mainlog({debug = false}= {}) {
    logvar.set_debug({"debug":debug})
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

function traceCaller() {
    const stack = new Error().stack;
    const stackLines = stack.split("\n");
    // Skip the first two lines: the first is the trace itself, the second is the trace for this function.
    const callerLine = stackLines[2];
    console.log("Called from:", callerLine);
}


export { logclass, mainlog }