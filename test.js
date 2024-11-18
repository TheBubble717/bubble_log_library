import {mainlog,logclass} from "./logging.js"
var log2 = new logclass({debug:true})
var log = mainlog({debug:true})

log.set_debug({debug:false})



async function test()
{
    await log.activatestream(`logs/`,"sdads.log")
    await log2.activatestream(`logs/`,"23123.log")
    log.addlog("test1",{color:"green",warn:"warnung"})
    log2.addlog("test2",{color:"blue",warn:"warnung"})
}
test()