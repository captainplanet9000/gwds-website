import { spawnSync } from 'node:child_process';
const configured=process.env.RESEND_FROM_EMAIL;
if(!configured)throw new Error('Sender configuration unavailable; no update performed');
const mailbox=(configured.match(/<([^<>]+)>/)?.[1]??configured).trim();
if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(mailbox))throw new Error('Invalid sender mailbox; no update performed');
const result=spawnSync(process.execPath,['C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js','--yes','vercel@62.5.0','env','update','RESEND_FROM_EMAIL','production','--scope','civals-projects','--yes'],{input:`Cival Systems <${mailbox}>\n`,encoding:'utf8',cwd:process.cwd()});
if(result.status!==0){console.error('Vercel sender configuration update failed');process.exit(1);}
console.log('Production sender display name updated to Cival Systems; existing verified mailbox preserved.');
