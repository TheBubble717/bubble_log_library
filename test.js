import {mainlog,logclass} from "./logging.js"
var log2 = new logclass()
var log = mainlog()



async function test()
{
    await log.activatestream(`logs/`,"sdads.log")
    await log2.activatestream(`logs/`,"23123.log")
    log.addlog("test1",{color:"green",warn:"warnung",debug:true})
    log2.addlog("test2",{color:"whiteBright",warn:"warnung"})
}
test()