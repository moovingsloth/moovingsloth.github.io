import sys,subprocess,os,json,asyncio
from playwright.sync_api import sync_playwright
name=sys.argv[1]; mode=sys.argv[2] if len(sys.argv)>2 else 'full'
here=os.path.dirname(os.path.abspath(__file__)); out=os.path.join(here,'out',name); os.makedirs(out,exist_ok=True)
FPS=30
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':720},device_scale_factor=1.5)
    pg.goto('file://'+os.path.join(here,name+'.html')); pg.wait_for_function('window.READY===true')
    film=pg.evaluate('FILM')
    if mode=='stills':
        for i,(st,du) in enumerate(film['scenes']):
            for k,frac in enumerate([0.5,0.9]):
                pg.evaluate(f'seek({st+du*frac})'); pg.screenshot(path=f'{out}/still_{i}_{k}.jpg',type='jpeg',quality=85)
        print(film); sys.exit()
    parts=[]
    only=[int(x) for x in sys.argv[3].split(',')] if len(sys.argv)>3 else None
    for i,(st,du) in enumerate(film['scenes']):
        if only is not None and i not in only: parts.append(f'{out}/s{i}.mp4'); continue
        tmp=f'{out}/s{i}.tmp.mp4'; fin=f'{out}/s{i}.mp4'
        ff=subprocess.Popen(['ffmpeg','-v','error','-y','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','20','-preset','medium','-pix_fmt','yuv420p','-vf','scale=1920:1080','-r',str(FPS),tmp],stdin=subprocess.PIPE)
        n=round(du*FPS)
        for f in range(n):
            pg.evaluate(f'seek({st+f/FPS})'); ff.stdin.write(pg.screenshot(type='jpeg',quality=92))
        ff.stdin.close()
        if ff.wait()!=0: sys.exit('ffmpeg failed')
        os.rename(tmp,fin); parts.append(fin)
    b.close()
lst=f'{out}/list.txt'; open(lst,'w').write(''.join(f"file '{x}'\n" for x in parts))
final=f'{here}/out/{name}.mp4'
subprocess.check_call(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy','-movflags','+faststart',final])
print(final, os.path.getsize(final)//1024,'KB')
