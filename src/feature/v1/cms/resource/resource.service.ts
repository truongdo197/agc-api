import _ from 'lodash';
import connRedis from '$config/redis';
import { KeyRedis } from '$types/enum/redis';

// export async function getAllResources() {
// 	// tạo key
// 	const redisKey = KeyRedis.resource.name(KeyRedis.environment.cms);
// 	// lấy value theo key
// 	const cacheData = await connRedis.get(redisKey);
// 	if (cacheData) return JSON.parse(cacheData);
// 	const [kens, cities] = await Promise.all([model.getAllKens(), model.getAllCities()]);
// 	const resource = {
// 		kens,
// 		cities,
// 	};
// 	// ghi value theo key
// 	connRedis.set(redisKey, JSON.stringify(resource));
// 	return resource;
// }
