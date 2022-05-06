import env from '$config/env';
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import md5 from 'md5';

const s3 = new aws.S3({
	secretAccessKey: env.awsUpload.secretAccessKey,
	accessKeyId: env.awsUpload.accessKeyId,
	region: env.awsUpload.region,
});

// https://www.npmjs.com/package/multer-s3
export default {
	upload: multer({
		storage: multerS3({
			s3: s3,
			bucket: env.awsUpload.bucket,
			acl: 'public-read',
			contentType: multerS3.AUTO_CONTENT_TYPE,
			metadata: (req, file, callback) => {
				callback(null, { fieldName: file.fieldname });
			},
			key: (req, file, callback) => {
				let arr_ext = (file.originalname || '').split('.');
				let md5FileName =
					arr_ext.length > 0
						? `${md5(file.originalname)}.${arr_ext[arr_ext.length - 1]}`
						: md5(file.originalname);
				callback(null, `${Date.now().toString()}-${md5FileName}`);
			},
		}),
	}),
};
