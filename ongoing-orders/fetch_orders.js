import axios from 'axios';
import crypto from 'crypto';
import { parseStringPromise } from 'xml2js';
import minimist from 'minimist';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function toIso(dateStr) {
  // Accept YYYY-MM-DD or full ISO; normalize to YYYY-MM-DDTHH:mm:ss
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00`;
  }
  return dateStr;
}

function buildWsseHeader(username, password) {
  const nonceBytes = crypto.randomBytes(16);
  const nonce = nonceBytes.toString('base64');
  const created = new Date().toISOString();
  const passwordDigest = crypto
    .createHash('sha1')
    .update(Buffer.concat([nonceBytes, Buffer.from(created, 'utf8'), Buffer.from(password, 'utf8')]))
    .digest('base64');

  const wsse = `UsernameToken Username="${username}", PasswordDigest="${passwordDigest}", Nonce="${nonce}", Created="${created}"`;
  return {
    'X-WSSE': wsse
  };
}

function buildOrderQueryXml({ from, to, goodsOwnerCode, customerId }) {
  const orderDateFrom = from ? `<OrderDateFrom>${from}</OrderDateFrom>` : '';
  const orderDateTo = to ? `<OrderDateTo>${to}</OrderDateTo>` : '';
  const goodsOwner = goodsOwnerCode ? `<GoodsOwnerCode>${goodsOwnerCode}</GoodsOwnerCode>` : '';
  const customer = customerId ? `<CustomerId>${customerId}</CustomerId>` : '';
  return `<?xml version="1.0" encoding="utf-8"?>
<GetOrdersByQuery xmlns="http://www.ongoingwarehouse.com/wsdl/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <orderQuery>
    ${goodsOwner}
    ${customer}
    ${orderDateFrom}
    ${orderDateTo}
  </orderQuery>
</GetOrdersByQuery>`;
}

async function fetchOrders({ from, to, baseUrl, username, password, goodsOwnerCode, customerId }) {
  const urlCandidates = [
    `${baseUrl}/GetOrdersByQuery`, // legacy SOAP-like endpoint
    `${baseUrl}/get-orders-by-query`,
    `${baseUrl}/api/v1/orders/getordersbyquery`
  ];

  const body = buildOrderQueryXml({ from, to, goodsOwnerCode, customerId });
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    ...buildWsseHeader(username, password)
  };

  let lastError = null;
  for (const url of urlCandidates) {
    try {
      const response = await axios.post(url, body, { headers, timeout: 30000 });
      const text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      // Try parse as XML; if JSON, this will throw and we handle as text
      try {
        const parsed = await parseStringPromise(text, { explicitArray: false, ignoreAttrs: false });
        return { url, format: 'xml', raw: text, data: parsed };
      } catch {
        return { url, format: 'json-or-text', raw: text, data: null };
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All endpoint candidates failed');
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  const dateFrom = toIso(argv.from || argv.f || process.env.ORDER_DATE_FROM);
  const dateTo = toIso(argv.to || argv.t || process.env.ORDER_DATE_TO);

  const baseUrl = (process.env.ONGOING_BASE_URL || '').replace(/\/$/, '');
  const username = requireEnv('ONGOING_USERNAME');
  const password = requireEnv('ONGOING_PASSWORD');
  const goodsOwnerCode = process.env.ONGOING_GOODS_OWNER_CODE || '';
  const customerId = process.env.ONGOING_CUSTOMER_ID || '';

  if (!baseUrl) {
    throw new Error('Missing ONGOING_BASE_URL');
  }

  const result = await fetchOrders({
    from: dateFrom,
    to: dateTo,
    baseUrl,
    username,
    password,
    goodsOwnerCode,
    customerId
  });

  const outDir = path.join(process.cwd(), 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(outDir, `orders_${stamp}.xml`);
  fs.writeFileSync(filename, result.raw, 'utf8');

  console.log(JSON.stringify({
    endpoint: result.url,
    format: result.format,
    saved: filename
  }, null, 2));
}

main().catch(err => {
  const status = err.response?.status;
  const body = err.response?.data;
  console.error('Request failed', { status });
  if (body) {
    try {
      const text = typeof body === 'string' ? body : JSON.stringify(body);
      console.error(text.slice(0, 4000));
    } catch {}
  }
  process.exit(1);
});

