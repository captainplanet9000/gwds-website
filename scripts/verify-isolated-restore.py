#!/usr/bin/env python3
"""Run as root on the Cival host. Uses a new network-isolated disposable database.
Never mounts live database volumes or publishes ports. Requires the existing backup.
"""
import subprocess,json,time,pathlib
name='cival-restore-audit-20260919'
def run(args,**kwargs):return subprocess.run(args,capture_output=True,text=True,**kwargs)
if run(['docker','inspect',name]).returncode==0:raise SystemExit('Existing recovery container; stop and inspect before reuse')
image=run(['docker','inspect','supabase-db','--format','{{.Config.Image}}']).stdout.strip()
cmd='initdb -D /tmp/cival-recovery -A trust >/tmp/init.log && exec postgres -D /tmp/cival-recovery -k /tmp -c listen_addresses= -c shared_preload_libraries=pg_net -c shared_buffers=64MB -c max_connections=20'
r=run(['docker','run','-d','--name',name,'--network','none','--memory','1g','--cpus','0.5','--user','postgres','--entrypoint','sh',image,'-c',cmd]);r.check_returncode()
try:
 for i in range(40):
  if run(['docker','exec',name,'pg_isready','-h','/tmp']).returncode==0:break
  time.sleep(1)
 else:raise RuntimeError('Recovery database did not start')
 roles=run(['docker','exec','supabase-db','psql','-U','postgres','-Atc',"select 'create role ' || quote_ident(rolname) || ' nologin;' from pg_roles where rolname not like 'pg_%' and rolname <> 'postgres'"]).stdout
 run(['docker','exec','-i',name,'psql','-h','/tmp','-U','postgres'],input=roles).check_returncode()
 latest=sorted(p for p in pathlib.Path('/var/backups/cival/daily').iterdir() if (p/'manifest.json').exists())[-1]
 started=time.time()
 with (latest/'postgres.dump').open('rb') as dump:
  result=subprocess.run(['docker','exec','-i',name,'pg_restore','-h','/tmp','-U','postgres','-d','postgres','--no-owner','--no-privileges'],stdin=dump,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=600)
 errors=result.stderr.decode()
 pathlib.Path('/var/backups/cival/restore-audit-20260919.log').write_text(errors)
 counts=run(['docker','exec',name,'psql','-h','/tmp','-U','postgres','-Atc',"select json_build_object('orders',(select count(*) from public.orders),'tenants',(select count(*) from control.tenants),'authUsers',(select count(*) from auth.users))"]).stdout.strip()
 report={'isolated':True,'network':'none','backup':latest.name,'seconds':round(time.time()-started),'restoreExit':result.returncode,'errorLines':[l for l in errors.splitlines() if 'ERROR:' in l][:12],'counts':counts}
 pathlib.Path('/var/backups/cival/restore-audit-20260919.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
 if result.returncode or not counts:
  raise SystemExit(result.returncode or 1)
finally:
 # Only this newly-created, network-isolated audit container is removed.
 run(['docker','rm','-f','-v',name]).check_returncode()
