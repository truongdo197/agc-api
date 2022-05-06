import mongoose from 'mongoose';
import log from '$config/log';
import env from '$config/env';

const logger = log('Index');
export default function initMongoose() {
	let authObj = {};
	if (env.mongo.user && env.mongo.password) {
		authObj = {
			auth: {
				user: env.mongo.user,
				password: env.mongo.password,
			},
		};
	}
	mongoose.connect(env.mongo.url, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		dbName: env.mongo.dbName,
		useCreateIndex: true,
		useFindAndModify: false,
		...authObj,
	});
	mongoose.connection.on('connected', function () {
		logger.info('Mongoose connected');
	});

	mongoose.connection.on('error', function (err) {
		logger.error('Cannot connect to mongodb');
		throw err;
	});

	mongoose.connection.on('disconnected', function () {
		logger.error('Mongoose disconnected');
	});
}
