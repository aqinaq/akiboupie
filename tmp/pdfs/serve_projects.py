from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from pathlib import Path
roots=['/Users/aruispan/akanki/akanki','/Users/aruispan/tourism/dist','/Users/aruispan/demo/dist','/Users/aruispan/demo2/dist','/Users/aruispan/aielts/dist','/Users/aruispan/redred/dist']
for i,root in enumerate(roots):
 if not Path(root).exists():continue
 s=ThreadingHTTPServer(('127.0.0.1',4310+i),partial(SimpleHTTPRequestHandler,directory=root));Thread(target=s.serve_forever,daemon=True).start()
print('Ready',flush=True)
Thread().join() if False else __import__('threading').Event().wait()
