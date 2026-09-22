"""Build reviewable drafts only. Does not publish or schedule posts."""
from pathlib import Path
import csv, json, math

root = Path(__file__).resolve().parent.parent / 'campaigns/2026-09-launch'
rows = []
for block in (root / 'posts.txt').read_text(encoding='utf-8').strip().split('\n\n'):
    lines = block.splitlines()
    topic, path, gate = lines[0].split('|')
    assert len(lines[1:]) == 5
    for text in lines[1:]:
        n = len(rows) + 1
        assert text.isascii()
        weight = len(text) + 24  # space + X's 23-character URL representation
        assert weight <= 280, (n, weight)
        url = 'https://www.civalsystems.com' + path + f'?utm_source=x&utm_medium=organic_social&utm_campaign=cival_launch_2026&utm_content=post_{n:03d}'
        demo = topic == 'Explore the demo'
        workflow = topic in ['Setup workflow','Risk and monitoring','Network clarity','Account permissions','Customization','Support and trust']
        rows.append(dict(id=f'{n:03d}', topic=topic, gate=gate,
            suggested_day=math.ceil(n/2), slot='AM' if n%2 else 'PM',
            text=text+' '+url, x_weighted_characters=weight,
            asset='assets/demo-overview.jpg' if demo else 'assets/workflow-square.png' if workflow else 'assets/launch-brand.png',
            alt_text='Broader Cival dashboard demo showing sample data, not measured performance.' if demo else 'Conceptual illustration of configure, validate and monitor stages; not a product screenshot.' if workflow else 'Conceptual modular computing artwork for Cival Systems, not a product screenshot.',
            status='DRAFT_NOT_PUBLISHED'))
assert len(rows) == 100 and len({r['text'] for r in rows}) == 100
with (root/'100-tweets.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader(); writer.writerows(rows)
(root/'100-tweets.json').write_text(json.dumps(rows, indent=2), encoding='utf-8')
(root/'100-tweets.md').write_text('# Cival Systems: 100 promotional drafts\n\nNothing has been published. Review CAMPAIGN.md and each gate before scheduling. Days are relative suggestions, not scheduled publication dates.\n\n' + '\n\n'.join(f"## {r['id']} | {r['topic']} | {r['gate']}\n\n{r['text']}\n\nAsset: {r['asset']} | X length: {r['x_weighted_characters']}" for r in rows), encoding='utf-8')
print(json.dumps({'posts':len(rows), 'maximumWeightedCharacters':max(r['x_weighted_characters'] for r in rows), 'gates':{g:sum(r['gate']==g for r in rows) for g in ['EDUCATION','HOSTING_REVIEW','SOURCE_HOLD']}}))
