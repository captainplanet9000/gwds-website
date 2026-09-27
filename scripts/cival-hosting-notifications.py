#!/usr/bin/env python3
"""Drain the authenticated website outbox without exposing its bearer secret."""
import json
import sys
import urllib.error
import urllib.request


def main():
    with open('/etc/cival/hosting-notification-cron.json', encoding='utf-8') as source:
        config = json.load(source)
    secret = config.get('CRON_SECRET')
    if not isinstance(secret, str) or not secret:
        raise RuntimeError('Production cron credential unavailable')
    request = urllib.request.Request(
        'https://www.civalsystems.com/api/cron/hosting-notifications',
        headers={'Authorization': 'Bearer ' + secret, 'Accept': 'application/json'},
    )
    try:
        with urllib.request.urlopen(request, timeout=65) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        print('Hosting notification drain HTTP failure: ' + str(error.code), file=sys.stderr)
        return 1
    except (urllib.error.URLError, TimeoutError):
        print('Hosting notification drain connection failure', file=sys.stderr)
        return 1
    if not all(isinstance(result.get(key), int) for key in ('processed', 'checked', 'failures')):
        raise RuntimeError('Unexpected notification drain response')
    print(json.dumps({key: result[key] for key in ('processed', 'checked', 'failures')}))
    return 1 if result['failures'] else 0


if __name__ == '__main__':
    sys.exit(main())

