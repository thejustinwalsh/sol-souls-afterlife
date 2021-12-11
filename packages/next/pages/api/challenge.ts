import nacl from 'tweetnacl';
import * as util from 'tweetnacl-util';
import base64url from 'base64url';
import bs58 from 'bs58';
import type { NextApiRequest, NextApiResponse } from 'next';

// https://tweetnacl.js.org/#/sign
const SECRET_KEY =
  process.env.SECRET_KEY || 'L2i93OqUCAsPhC2/Wd4NYA3kW0HTdhPIKQ1aAP6s2ngi2mjCoVYhBYXidcuANs7kvxDKgngBETKR6a55TaZLSw==';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // Abort if we have not setup our keys in the env
  if (process.env.NODE_ENV === 'production' && SECRET_KEY != process.env.SECRET_KEY) {
    console.error('SECRET_KEY is not set correctly');
    return res.status(500).end();
  }

  // Generate a new JWT challenge
  if (req.method === 'GET') {
    const { address } = req.query;
    const salt = util.encodeBase64(nacl.randomBytes(8));
    const id = util.encodeBase64(nacl.hash(util.decodeUTF8(`${address}:${salt}`)));

    const header = { alg: 'Ed25519', typ: 'JWT' };
    const payload = {
      iss: 'https://sol-souls-afterlife.tjw.dev/challenge',
      jti: id,
      sub: address,
      aud: 'nakama.tjw.dev',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60,
    };

    const keyPair = nacl.sign.keyPair.fromSecretKey(util.decodeBase64(SECRET_KEY));
    const h = base64url.encode(JSON.stringify(header));
    const p = base64url.encode(JSON.stringify(payload));
    const s = base64url.encode(util.encodeBase64(nacl.sign.detached(util.decodeUTF8(`${h}.${p}`), keyPair.secretKey)));

    return res.status(200).json({ signature: `${h}.${p}.${s}` });
  }

  // Verify the JWT challenge
  if (req.method === 'POST') {
    const { challenge, signature: challengeSig } = JSON.parse(req.body) as {
      challenge: string;
      signature: { publicKey: string; signature: string };
    };
    if (!challenge) {
      return res.status(400).end();
    }
    const [header, payload, signature] = challenge.split('.');
    if (!header || !payload || !signature) {
      return res.status(400).end();
    }

    const h = base64url.decode(header);
    const p = base64url.decode(payload);
    const s = base64url.decode(signature);

    const keyPair = nacl.sign.keyPair.fromSecretKey(util.decodeBase64(SECRET_KEY));
    if (!nacl.sign.detached.verify(util.decodeUTF8(`${header}.${payload}`), util.decodeBase64(s), keyPair.publicKey)) {
      return res.status(400).end();
    }

    const { sub, jti, exp } = JSON.parse(p) as { sub: string; jti: string; exp: number };

    // Verify token is still valid (replay)
    if (exp < Math.floor(Date.now() / 1000)) {
      return res.status(400).end();
    }

    // Verify challenge
    if (
      sub != challengeSig.publicKey ||
      !nacl.sign.detached.verify(
        util.decodeUTF8(challenge),
        new Uint8Array(bs58.decode(challengeSig.signature)),
        new Uint8Array(bs58.decode(sub))
      )
    ) {
      return res.status(400).end();
    }

    return res.status(200).json({ id: jti });
  }

  return res.status(402).end();
}
