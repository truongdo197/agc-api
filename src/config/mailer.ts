import sgMail from '@sendgrid/mail';
import env from '$config/env';
import log from '$config/log';
const logger = log('Mailer');

interface IMailParams {
	to: string;
	title: string;
	content: string;
}

sgMail.setApiKey(env.sendgrid.apiKey);
export default function sendMail({ to, title, content }: IMailParams) {
	sgMail
		.send({
			to,
			from: {
				email: env.sendgrid.address,
				name: env.sendgrid.fromName,
			}, // Use the email address or domain you verified above
			subject: title,
			text: content,
			html: content,
		})
		.then((data) => logger.info(`Send Mail to ${to} success!`))
		.catch((error) => {
			logger.error(error?.response?.body || error);
		});
}
