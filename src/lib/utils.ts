import validator from "validator";
import { matchPattern } from "url-matcher";
import JWT from "@/lib/jwt.ts";
import { Buffer } from "node:buffer";

// JWT Timeout
// Set to something vercel/ms can understand
export const timeout = "10m";
export const endpoints = {
	"none": ["/", "/login", "/api/captcha", "/api/auth", "/_next/static/**/*.*"],
	"full": ["/api/test-auth-status"]
};
export const jwtBuilder = new JWT.JWT(Buffer.from(process.env.JWT_KEY, "hex"));

export function urlMatchArray(urlArray, path) {
	let matched = false;
	for (const url of urlArray) {
		matched = matchPattern(url, path);
		if (matched) {
			break;
		}
	}
	return matched;
}

export function validateURLArray(urls: string[]): boolean {
	return urls.reduce((acc, e) => {
		return acc && validator.isURL(e, {
			protocols: ["http","https"],
			require_tld: false,
			require_host: false,
			allow_underscores: true,
			allow_protocol_relative_urls: true,
			allow_query_components: false,
		});
	}, true);
}

export function cookieOptsToString(cookieOpts: CookieSerializeOptions): string {
	const optsKeys = Object.keys(cookieOpts);
	let strForm = cookieOpts.name + "=" + (cookieOpts.encode ? cookieOpts.encode(cookieOpts.value) : cookieOpts.value);
	for (let i = 0; i < optsKeys.length; i++) {
		const opt = optsKeys[i];
		switch (opt) {
			case "name":
				break;
			case "value":
				break;
			case "encode":
				break;
			case "domain":
				strForm = strForm + ((cookieOpts.domain != undefined) ? ("; Domain=" + cookieOpts.domain) : "");
				break;
			case "expires":
				if (!(cookiesOpts.expires instanceof Date)) {
					break;
				}
				const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][cookieOpts.expires.getUTCDay()];
				const dayOfMonth = (cookieOpts.expires.getUTCDate().toString().length == 1 ? "0" + cookieOpts.expires.getUTCDate() : cookieOpts.expires.getUTCDate()).toString();
				const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][cookieOpts.expires.getUTCMonth()];
				const year = cookieOpts.expires.getUTCFullYear().toString();
				const hour = cookieOpts.expires.getUTCHours().toString();
				const minute = cookieOpts.expires.getUTCMinutes().toString();
				const second = cookieOpts.expires.getUTCSeconds().toString();
				strForm = strForm + "; Expires=" + dayOfWeek + ", " + dayOfMonth + " " + month + " " + year + " " + hour + ":" + minute + ":" + second + " GMT";
				break;
			case "httpOnly":
				strForm = strForm + (cookieOpts.httpOnly ? "; HttpOnly" : "");
				break;
			case "maxAge":
				strForm = strForm + (Number.isInteger(cookieOpts.maxAge) ? ("; Max-Age=" + cookieOpts.maxAge.toString()) : "");
				break;
			case "partitioned":
				strForm = strForm + (cookieOpts.partitioned ? "; Partitioned" : "");
				break;
			case "path":
				strForm = strForm + ((cookieOpts.path != undefined) ? ("; Path=" + cookieOpts.path) : "");
				break;
			case "priority":
				strForm = strForm + ((cookieOpts.priority == "low" || cookieOpts.priority == "medium" || cookieOpts.priority == "high") ? ("; Priority=" + cookieOpts.priority) : "");
				break;
			case "sameSite":
				strForm = strForm + ((cookieOpts.sameSite === true || cookieOpts.sameSite == "strict" || cookieOpts.sameSite == "lax" || cookieOpts.sameSite == "none") ? ("; SameSite=" + (cookieOpts.sameSite === true ? "strict" : cookieOpts.sameSite)) : "");
				break;
			case "secure":
				strForm = strForm + (cookieOpts.secure ? "; Secure" : "");
				break;
			default:
				console.log(optsKeys);
				console.log(opt);
				console.log(i);
				throw new Error("Invalid Cookie Header");
		}
	}
	return strForm;
}

export function cookieOptions(name: string, value: string, overrides: CookieSerializeOptions = {}): CookieSerializeOptions {
	let options = {
		name: name,
		value: value,
		domain: ".lvoz2.duckdns.org",
		maxAge: 3600000,
		path: "/",
		httpOnly: true,
		sameSite: "strict",
		secure: true
	}
	for (key in Object.keys(overrides)) {
		options[key] = overrides[key]
	}
	return options;
};

export default { endpoints, timeout, cookieOptions, cookieOptsToString, urlMatchArray, jwtBuilder };