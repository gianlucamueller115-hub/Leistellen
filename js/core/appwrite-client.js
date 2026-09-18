import { Client } from 'https://cdn.jsdelivr.net/npm/appwrite@17.0.0/+esm';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6aaaa87100118d5c9b34');

window.AppwriteClient = client;
export { client };