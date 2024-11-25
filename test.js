import {mainlog,logclass} from "./logging.js"
var log2 = new logclass({addcallerlocation:true})
var log = mainlog({nodisplay:true})

log.set_settings({addcallerlocation:true})



async function test()
{
    await log.activatestream(`logs/`,"sdads.log")
    await log2.activatestream(`logs/`,"23123.log")
    log.addlog("test1",{color:"green",warn:"warnung"})
    log2.addlog("test2",{color:"blue",warn:"warnung"})
}
test()