import _ from 'lodash';
import { IListProduct } from './product.interface';
import env from '$config/env';
import esClient from '$config/elaticsearch';

export async function searchSubProduct(params: IListProduct) {
	const { body } = await esClient.search({
		index: env.elasticsearch.indexName,
		filter_path: ['hits.hits._source', 'hits.hits._id'],
		body: {
			query: {
				bool: {
					must: [
						{
							multi_match: {
								query: params.keyword || '',
								fields: ['title^3', 'sku', 'code.value'],
							},
						},
						{
							term: {
								active: {
									value: true,
								},
							},
						},
						{
							term: {
								status: {
									value: 1,
								},
							},
						},
					],
					filter: {
						exists: {
							field: 'productId',
						},
					},
				},
			},
			sort: {
				_score: 'desc',
			},
			collapse: {
				field: 'productId',
			},
			size: 20,
		},
	});
	return handleReturn(body?.hits?.hits);
}
export async function getListSubProduct(params: IListProduct) {
	const { body } = await esClient.search({
		index: env.elasticsearch.indexName,
		filter_path: ['hits.hits._source', 'hits.hits._id'],

		body: {
			query: {
				bool: {
					must: [
						{
							match_all: {},
						},
						{
							term: {
								active: {
									value: true,
								},
							},
						},
						{
							term: {
								status: {
									value: 1,
								},
							},
						},
					],
					filter: {
						exists: {
							field: 'productId',
						},
					},
				},
			},
			sort: {
				_score: 'desc',
			},
			collapse: {
				field: 'productId',
			},
			size: 10,
		},
	});
	return handleReturn(body?.hits?.hits);
}
async function handleReturn(subProducts) {
	return _.map(subProducts, (subProduct) => {
		return { _id: subProduct._id, ...subProduct._source };
	});
}
