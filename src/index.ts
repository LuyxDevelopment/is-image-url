import { parse } from 'url';
import isImage from 'is-image';
import isUrl from 'is-url';
import request from 'sync-request';

export default function isImageUrl(url: string, accurate: boolean, timeout = 60000) {
	const http = url.lastIndexOf('http');

	if (http != -1) {
		url = url.substring(http);
	}

	if (!isUrl(url)) {
		return isImage(url);
	}

	let pathname = parse(url).pathname;

	if (!pathname) {
		return false;
	}

	const last = pathname.search(/[:?&]/);

	if (last != -1) {
		pathname = pathname.substring(0, last);
	}

	if (isImage(pathname)) {
		return true;
	}

	if (/styles/i.test(pathname)) {
		return false;
	}

	try {
		if (!accurate) {
			return false;
		}

		const res = request('GET', url, { timeout });

		if (!res) {
			return false;
		}

		const headers = res.headers;

		if (!headers) {
			return false;
		}

		const contentType = headers['content-type'];

		if (!contentType) {
			return false;
		}

		return contentType.search(/^image\//) != -1;
	} catch (e) {
		return false;
	}
};