#!/usr/bin/env python3
"""Host-local, read-only collector. Writes allowlisted metrics; never reads secrets."""
import datetime, json, os, shutil, subprocess

def run(args, allow_inactive=False):
    result = subprocess.run(args, capture_output=True, text=True, timeout=20)
    if result.returncode and not allow_inactive:
        raise RuntimeError("Telemetry command failed: " + args[0])
    return result.stdout.strip()

mem = {}
with open('/proc/meminfo') as f:
    for line in f:
        key, value = line.split(':', 1)
        mem[key] = int(value.split()[0])
disk = shutil.disk_usage('/')
services = {}
for name in ['caddy', 'cival-host-agent', 'cival-scheduler', 'cival-gateway', 'cival-gateway-watch', 'cival-daily-backup.timer', 'snap.amazon-ssm-agent.amazon-ssm-agent']:
    unit = name if name.endswith('.timer') else name + '.service'
    services[name] = run(['systemctl', 'is-active', unit], allow_inactive=True) or 'unknown'
containers = []
for line in run(['docker', 'ps', '-a', '--format', '{{json .}}']).splitlines():
    row = json.loads(line)
    containers.append({'name': row.get('Names'), 'state': row.get('State'), 'status': row.get('Status')})
backup = run(['systemctl', 'show', 'cival-daily-backup', '-p', 'Result', '-p', 'ExecMainStatus', '-p', 'ExecMainExitTimestamp'])
metrics = {
    'cpuCount': os.cpu_count(), 'loadAverage': list(os.getloadavg()),
    'memoryTotalMb': round(mem['MemTotal']/1024),
    'memoryAvailableMb': round(mem['MemAvailable']/1024),
    'memoryUsedPercent': round(100*(1-mem['MemAvailable']/mem['MemTotal']),1),
    'diskTotalGb': round(disk.total/1024**3,1), 'diskFreeGb': round(disk.free/1024**3,1),
    'diskUsedPercent': round(disk.used/disk.total*100,1),
    'services': services, 'containers': containers,
    'backup': dict(line.split('=',1) for line in backup.splitlines() if '=' in line),
}
payload=json.dumps(metrics).replace("'", "''")
sql="insert into control.host_telemetry(host, observed_at, metrics) values ('cloud-01',now(),'"+payload+"'::jsonb) on conflict(host) do update set observed_at=excluded.observed_at, metrics=excluded.metrics;"
subprocess.run(['docker','exec','-i','supabase-db','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1'],input=sql,text=True,check=True,timeout=20,capture_output=True)
