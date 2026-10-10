import re
with open('Demo website/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

sections = re.findall(r'<section[^>]*data-framer-name=[\"\']([^\"\']+)[\"\'][^>]*>', content)
print("Sections:", sections)

# Also let's extract all unique text blocks that look like headers or features
seen = set()
headings = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', content)
print("\nUnique Headings:")
for h in headings:
    clean = re.sub(r'<[^>]+>', '', h).strip()
    if clean and clean not in seen:
        seen.add(clean)
        print("  -", clean)
