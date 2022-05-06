const MAX_MEMORY_RESTART = '1000M';
const KILL_TIMEOUT = 5000;
const WAIT_READY = true;
const LISTEN_TIMEOUT = 20000;

module.exports = {
	apps: [
		{
			name: 'agriconnect-api',
			script: './dist/index.js',
			watch: false,
			kill_timeout: KILL_TIMEOUT,
			wait_ready: WAIT_READY,
			listen_timeout: LISTEN_TIMEOUT,
			max_memory_restart: MAX_MEMORY_RESTART,
			env: {
				PORT: 3000,
				NODE_ENV: 'dev',
			},
			env_production: {
				PORT: 3000,
				NODE_ENV: 'prod',
			},
		},
		{
			name: 'agriconnect-api-stg',
			script: './dist/index.js',
			watch: false,
			kill_timeout: KILL_TIMEOUT,
			wait_ready: WAIT_READY,
			listen_timeout: LISTEN_TIMEOUT,
			max_memory_restart: '1000M',
			env_staging: {
				PORT: 3000,
				NODE_ENV: 'staging',
				DB_NAME_MONGO: 'agc_staging',
			},
		},
		{
			name: 'agriconnect-api-prod',
			script: './dist/index.js',
			watch: false,
			kill_timeout: KILL_TIMEOUT,
			env_staging: {
				PORT: 3000,
				NODE_ENV: 'production',
				DB_NAME_MONGO: 'agriconnect',
			},
		},
	],
};
