import { ErrorCode } from '$enum/common';
import log from '$config/log';

let io;
const logger = log('SocketIO');
const socketModule = {
	init: (httpServer) => {
		io = require('socket.io')(httpServer);
		logger.info(`SocketIO has been initialized!`);
		return io;
	},
	getIO: () => {
		if (!io) {
			throw ErrorCode.Socket_Not_Initialized;
		}
		return io;
	},
};

export default socketModule;
