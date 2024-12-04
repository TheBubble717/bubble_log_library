import { mainlog, logclass } from "./logging.js"
var log3 = new logclass({ addcallerlocation: true ,screenLogLevel :2})
var log2 = new logclass({ addcallerlocation: true })
var log = mainlog({ nodisplay: false })

log.set_settings({ addcallerlocation: false })


process.on('uncaughtException',async function(error) {
    log3.em.emit("exit")
    log2.em.emit("exit")
    log.em.emit("exit")
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1)
});

process.on('unhandledRejection', async function(reason, promise) {
    log.addlog(reason.stack)
    log3.em.emit("exit")
    log2.em.emit("exit")
    log.em.emit("exit")
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1)
});



async function test() {
    await log.activatestream(`logs/`, "sdads.log")
    await log2.activatestream(`logs/`, "23123.log")
    await log2.activatestream(`logs/`, "home.log")
    log.addlog("test1", { color: "green", warn: "warnung" })
    log2.addlog("test2", { color: "blue", warn: "warnung" })
    log3.addlog("test3", { color: "blue", warn: "warnung" }) //Something is not set -> Same as no settings at all!
    log3.addlog("test4", { color: "blue", warn: "warnung", level:3 })
    log.addlog("test5")




    var timetocomplete1 = {
        "start": new Date().getTime(),
        "stop": null
    }
    for (let i = 0; i < 100000; i++) {
        log.addlog(i)
        if(i==10 ){ 
            dsdsad //
        }
    }
    timetocomplete1.stop = new Date().getTime();


    console.log(`${timetocomplete1.stop - timetocomplete1.start}ms`)


}
test()

