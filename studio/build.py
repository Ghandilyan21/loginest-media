"""Render a full episode: python3 -I build.py ep_module out.mp4

Renders every scene of the module's R.SCENES (2 at a time), then joins them.
Run from the studio/ folder.
"""
import importlib, os, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

mod_name, out = sys.argv[1], os.path.abspath(sys.argv[2])
mod = importlib.import_module(mod_name)
import render as R

n = len(R.SCENES)
tmp = tempfile.mkdtemp(prefix="ep_")
files = []
here = os.path.dirname(os.path.abspath(__file__))
for i in range(0, n, 2):
    batch = []
    for j in range(i, min(i + 2, n)):
        f = os.path.join(tmp, f"s{j}.mp4"); files.append(f)
        batch.append(subprocess.Popen([sys.executable, os.path.join(here, mod_name + ".py"), "full", str(j), f], cwd=here))
    for p in batch:
        if p.wait() != 0: sys.exit("scene render failed")
for f in files:
    if not os.path.exists(f): sys.exit(f"missing {f}")
lst = os.path.join(tmp, "list.txt")
with open(lst, "w") as fh:
    fh.writelines(f"file '{f}'\n" for f in files)
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out])
print(out)
