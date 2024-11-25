import { mainlog, logclass } from "./logging.js"
var log3 = new logclass({ addcallerlocation: true ,displayatleastlevel :2})
var log2 = new logclass({ addcallerlocation: true })
var log = mainlog({ nodisplay: false })

log.set_settings({ addcallerlocation: false })



async function test() {
    await log.activatestream(`logs/`, "sdads.log")
    await log2.activatestream(`logs/`, "23123.log")
    await log2.activatestream(`logs/`, "home.log")
    log.addlog("test1", { color: "green", warn: "warnung" })
    log2.addlog("test2", { color: "blue", warn: "warnung" })
    log3.addlog("test3", { color: "blue", warn: "warnung" }) //Something is not set -> Same as no settings at all!
    log3.addlog("test3_2", { color: "blue", warn: "warnung", level:3 })



    var timetocomplete1 = {
        "start": new Date().getTime(),
        "stop": null
    }
    for (let i = 0; i < 100000; i++) {
        log.addlog(i)
    }
    timetocomplete1.stop = new Date().getTime();



    var timetocomplete2 = {
        "start": new Date().getTime(),
        "stop": null
    }
    for (let i = 0; i < 100000; i++) {
        console.log(i)
    }
    timetocomplete2.stop = new Date().getTime();



    console.log(`${timetocomplete1.stop - timetocomplete1.start}ms`)

    console.log(`${timetocomplete2.stop - timetocomplete2.start}ms`)




}
test()

