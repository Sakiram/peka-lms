import { inviteWorker } from './inviteWorker';

console.log('Invite worker started...');

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await inviteWorker.close();
  process.exit(0);
});