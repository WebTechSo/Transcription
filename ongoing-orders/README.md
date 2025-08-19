# Ongoing WMS Orders Fetcher

CLI tool to fetch Ongoing Warehouse orders by date range using XML + WSSE headers.

## Setup

1. Copy .env.example to .env and fill values:

cp .env.example .env

- ONGOING_BASE_URL: Base URL provided by Ongoing for your tenant (remove trailing slash)
- ONGOING_USERNAME, ONGOING_PASSWORD: API credentials
- ONGOING_GOODS_OWNER_CODE (optional)
- ONGOING_CUSTOMER_ID (optional)

2. Install dependencies:

npm i

## Usage

Run a fetch by date range:

node fetch_orders.js --from 2025-08-01 --to 2025-08-19

Or use env vars ORDER_DATE_FROM / ORDER_DATE_TO.

The raw response is saved under output/orders_*.xml and basic metadata is printed to stdout.

## Notes

- The client constructs an X-WSSE header with UsernameToken and posts an XML GetOrdersByQuery body. Exact endpoint paths differ across tenants; the script tries a few common paths. Set ONGOING_BASE_URL to the exact base path if you know it to avoid trial attempts.
- If your Ongoing environment expects a SOAP envelope, adapt buildOrderQueryXml accordingly.