"""Leak check: every file of the demo must be free of the words on a private list (names, places, account endings,
amounts) that is kept outside this repo. Run before every commit / publish:

    python3 tools/leakcheck.py [path/to/denylist.txt]

Default list path: $SHOWCASE_DENYLIST, else ../01 App/var/showcase/denylist.txt. No list = fail (never a silent pass).
Exit code 0 = clean, 1 = something found (the finding prints the file and line, never the list itself in bulk).
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT = os.path.join(os.path.dirname(ROOT), "01 App", "var", "showcase", "denylist.txt")
TEXT = (".html", ".js", ".css", ".json", ".webmanifest", ".md", ".txt", ".py", ".svg")


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SHOWCASE_DENYLIST", DEFAULT)
    if not os.path.exists(path):
        print("FAIL: no denylist at %s" % path)
        return 1
    terms = [t.strip() for t in open(path, encoding="utf-8") if t.strip()]
    pats = []
    for t in terms:
        esc = re.escape(t)
        pats.append((t, re.compile(r"(?<![0-9])%s(?![0-9])" % esc if t[0].isdigit() else r"\b%s\b" % esc, re.I)))
    hits = 0
    files = 0
    for dp, dns, fns in os.walk(ROOT):
        dns[:] = [d for d in dns if d != ".git"]
        for fn in fns:
            if not fn.endswith(TEXT):
                continue
            files += 1
            fp = os.path.join(dp, fn)
            for i, line in enumerate(open(fp, encoding="utf-8", errors="replace"), 1):
                for t, p in pats:
                    if p.search(line):
                        hits += 1
                        print("LEAK %s:%d  matches a listed term (%d chars)" % (os.path.relpath(fp, ROOT), i, len(t)))
    print("%s: %d files checked against %d terms, %d hit(s)" % ("FAIL" if hits else "OK", files, len(terms), hits))
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main())
