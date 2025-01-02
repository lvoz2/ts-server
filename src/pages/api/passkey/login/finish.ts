import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuthenticationResponse, type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/server";
import utils from "@/lib/utils.ts";
import { authenticate } from "@/lib/authenticate.ts";
import { getDB, queryDB } from "@/lib/db.ts";

const db = getDB();
const authService = authenticate(utils.endpoints, utils.timeout, utils.cookieOptions);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		if (!utils.betterIsJWT(req.body.jwt)) {
			res.json({status: false});
			//throw new Error("A JWT-like string must be given to this API");
		} else {
			const clientOpts = req.body.options;
			console.log(clientOpts);
			// Get user id and name
			const user = (await queryDB(db, "SELECT id, username FROM users WHERE username = ?;", [req.body.username]))[0];
			// Get options from POST to /api/passkey/login/start
			const { payload, protectedHeader } = await utils.jwtBuilder.verify(req.body.jwt);
			// Remove JWT-specific properties, leaving the options
			delete payload.jti;
			delete payload.exp;
			const currentOptions: PublicKeyCredentialRequestOptionsJSON = payload;
			// Get passkey that will be used for the final step
			const passkey = await queryDB(db, "SELECT * FROM passkeys WHERE credential_id = ? AND user_id = ?;", [clientOpts.id, user.id]);
			if (!passkey) {
				console.log("Could not find passkey " + clientOpts.id + " for user " + user.id);
			} else if (passkey.length === 0) {
				console.log("Could not find passkey " + clientOpts.id + " for user " + user.id);
			}
			/*let verification;
			try {*/
			const verification = await verifyAuthenticationResponse({
				response: clientOpts,
				expectedChallenge: currentOptions.challenge,
				expectedOrigin: utils.passkeyRp.origin,
				expectedRPID: utils.passkeyRp.id,
				credential: {
					id: passkey[0].id,
					publicKey: passkey[0].public_key,
					counter: passkey[0].counter,
					transports: passkey[0].transports,
				},
			});
			/*} catch (error) {
				console.error(error);
				return res.status(400).send({ error: error.message });
			}*/
			const newCounter = verification.authenticationInfo.newCounter;
			queryDB(db, "UPDATE passkeys SET counter = ? WHERE credential_id = ?;", [newCounter, passkey[0].credential_id]);
			const verified = verification.verified;
			if (verified) {
				const options = await authService.authenticatePasskey(user.username, utils.timeout);
				let cookies = res.getHeader("Set-Cookie") || [];
				cookies.push(utils.cookieOptsToString(options));
				res.setHeader("Set-Cookie", cookies);
			}
			res.json({status: verified});
		}
	} else {

	}
}
