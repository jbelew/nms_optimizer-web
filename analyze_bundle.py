import json

with open('/home/jbelew/projects/nms_optimizer-web/stats.json', 'r') as f:
    data = json.load(f)

dependencies = {}

for uid, info in data['nodeMetas'].items():
    if 'node_modules' in info['id']:
        parts = info['id'].split('/')
        dep_name = parts[2] if not parts[2].startswith('@') else f'{parts[2]}/{parts[3]}'
        if dep_name not in dependencies:
            dependencies[dep_name] = {
                'renderedLength': 0,
                'gzipLength': 0,
                'brotliLength': 0
            }
        for part in info['moduleParts'].values():
            dependencies[dep_name]['renderedLength'] += data['nodeParts'][part]['renderedLength']
            dependencies[dep_name]['gzipLength'] += data['nodeParts'][part]['gzipLength']
            dependencies[dep_name]['brotliLength'] += data['nodeParts'][part]['brotliLength']

sorted_deps = sorted(dependencies.items(), key=lambda item: item[1]['renderedLength'], reverse=True)

print("Dependency sizes (rendered):")
for dep, sizes in sorted_deps:
    print(f"{dep}: {sizes['renderedLength'] / 1024:.2f} KB")
