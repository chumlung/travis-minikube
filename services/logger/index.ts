import { QueueService } from "./queue-service";
import {LogginService, severityList} from './logging-service'

const loggingService = new LogginService()

function action(message: string, severity: severityList){
  loggingService.sendMessage(message, severity)
}

// loggingService.sendMessage("YOU GUYS ARE WATCHING MY SCREEN :D", severityList.info)

const queueService = new QueueService(action)

queueService.connect();

const exitHandler = () => {
queueService.disconnect();
}
process.stdin.resume();

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));