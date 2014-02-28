import json, csv

def c2rgb(c):
    return [int(x, 16) for x in (c[1:3], c[3:5], c[5:7])]

def rgb2c(rgb):
    return '#' + ''.join("%02x" % i for i in rgb)

def rgb2score(rgb):
    r, g, b = rgb
    i = min(1, (r + g) / 256)
    c = 256.0 * r / (r + g)
    if g > r:
        return (g + r) / 4.0
    else:
        return 128 + c / 2.0

with open("PRISM.json") as f:
    prism = json.load(f)

countries = {}
with open("countrycodes.json") as f:
    for row in json.load(f):
        countries[row['Name'].lower()] = row['Code']

cc = [c2rgb(c) for c in set(prism.values()) if c != "#e0e0e0"]
ccc = [[rgb2score(rgb), rgb] for rgb in cc]

ccc.sort(lambda a, b: cmp(a[0], b[0]))

for i, a in enumerate(ccc):
    a[0] = 5 - 5.0 * i / (len(ccc)-1)

colors = {"#e0e0e0": None}
for a in ccc:
    colors[rgb2c(a[1])] = a[0]

prism = dict((countries.get(key.lower(), key), colors[value]) for key, value in prism.iteritems())
prism["Category"] = "NSA surveillance/Boundless Informant coverage"

with open("PRISM2.json", "w") as f:
    json.dump(prism, f)

with open("colors.html", "w") as f:
    f.write("<html><body>")
    for c in ccc:
        f.write("""<div style='display: inline-block; background: %s;'>%.2f</div>
""" % (rgb2c(c[1]), c[0]))
    f.write("</body></html>")
