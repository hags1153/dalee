#!/usr/bin/env python3
"""Render App Store screenshots of the revamped Dalee UI (hub + games)."""
from PIL import Image, ImageDraw, ImageFont
import os

BG_TOP=(11,12,16); BG_BOT=(18,19,28); SURF=(26,28,38); SURF_HI=(36,39,55)
HAIR=(44,47,62); TXT=(244,246,251); DIM=(167,173,194); FAINT=(107,112,134)
CORRECT=(34,197,94); PRESENT=(245,185,66); ABSENT=(58,62,78); ACCENT=(124,92,255)
GH={"wordle":(34,197,94),"scramble":(139,92,246),"ladder":(14,165,233),"missing":(245,158,11),"blitz":(244,63,94)}
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONTR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def f(sz,bold=True): return ImageFont.truetype(FONT if bold else FONTR,sz)
def ctext(d,cx,y,s,fnt,fill): b=d.textbbox((0,0),s,font=fnt); d.text((cx-(b[2]-b[0])/2-b[0],y),s,font=fnt,fill=fill)
def ltext(d,x,y,s,fnt,fill): d.text((x,y),s,font=fnt,fill=fill)

def bg(W,H):
    img=Image.new("RGB",(W,H)); px=img.load()
    for y in range(H):
        t=y/H; px0=(int(BG_TOP[0]+(BG_BOT[0]-BG_TOP[0])*t),int(BG_TOP[1]+(BG_BOT[1]-BG_TOP[1])*t),int(BG_TOP[2]+(BG_BOT[2]-BG_TOP[2])*t))
        for x in range(W): px[x,y]=px0
    return img
def grad_box(img,box,c1,c2):
    x0,y0,x1,y1=box; d=ImageDraw.Draw(img)
    for i in range(int(x1-x0)):
        t=i/max(1,(x1-x0)); c=(int(c1[0]+(c2[0]-c1[0])*t),int(c1[1]+(c2[1]-c1[1])*t),int(c1[2]+(c2[2]-c1[2])*t))
        d.line([(x0+i,y0),(x0+i,y1)],fill=c)

def hub(W,H):
    img=bg(W,H); d=ImageDraw.Draw(img); m=int(W*0.055); s=W/430.0
    y=int(H*0.055)
    ltext(d,m,y,"DALEE",f(int(40*s)),TXT); ltext(d,m,y+int(46*s),"Wednesday, July 22",f(int(13*s),False),FAINT)
    # avatar
    d.rounded_rectangle([W-m-int(44*s),y,W-m,y+int(44*s)],radius=int(22*s),fill=SURF,outline=HAIR,width=2)
    ctext(d,W-m-int(22*s),y+int(9*s),"@",f(int(20*s)),DIM)
    # stat strip
    sy=y+int(80*s); d.rounded_rectangle([m,sy,W-m,sy+int(78*s)],radius=int(20*s),fill=SURF,outline=HAIR,width=2)
    labels=[("STREAK","12"),("TODAY","3/5"),("BEST","24")]; colw=(W-2*m)/3
    for i,(lab,val) in enumerate(labels):
        cx=m+colw*i+colw/2; ctext(d,cx,sy+int(16*s),val,f(int(24*s)),TXT); ctext(d,cx,sy+int(48*s),lab,f(int(11*s)),FAINT)
        if i: d.line([(m+colw*i,sy+int(14*s)),(m+colw*i,sy+int(64*s))],fill=HAIR)
    # circuit header
    cy=sy+int(110*s); ltext(d,m,cy,"Today's Circuit",f(int(26*s)),TXT);
    b=d.textbbox((0,0),"~25 min · 5 games",font=f(int(13*s),False)); ltext(d,W-m-(b[2]-b[0]),cy+int(14*s),"~25 min · 5 games",f(int(13*s),False),FAINT)
    # cards
    games=[("1. Wordle","Guess the word","wordle","+90",True),("2. Scramble","Unscramble it","scramble","+80",True),
           ("3. Ladder","One letter at a time","ladder","+70",True),("4. Missing","Fill the blanks","missing","",False),
           ("5. Blitz","60-second word rush","blitz","",False)]
    gy=cy+int(52*s); ch=int(78*s); gap=int(12*s)
    for name,tag,key,score,done in games:
        d.rounded_rectangle([m,gy,W-m,gy+ch],radius=int(20*s),fill=SURF,outline=(CORRECT if done else HAIR),width=2)
        bx=m+int(14*s); bs=int(52*s); grad_box(img,[bx,gy+int(13*s),bx+bs,gy+int(13*s)+bs],GH[key],tuple(min(255,c+40) for c in GH[key]))
        # re-round badge corners by overpainting? skip; draw initial
        ctext(d,bx+bs/2,gy+int(13*s)+int(bs*0.22),key[0].upper(),f(int(26*s)),(255,255,255))
        ltext(d,bx+bs+int(16*s),gy+int(16*s),name,f(int(19*s)),TXT); ltext(d,bx+bs+int(16*s),gy+int(44*s),tag,f(int(13*s),False),FAINT)
        if done:
            pill=f(int(15*s)); b=d.textbbox((0,0),score,font=pill); pw=(b[2]-b[0])+int(24*s)
            d.rounded_rectangle([W-m-int(14*s)-pw,gy+int(24*s),W-m-int(14*s),gy+int(24*s)+int(30*s)],radius=int(15*s),fill=(20,60,40))
            ctext(d,W-m-int(14*s)-pw/2,gy+int(29*s),score,pill,CORRECT)
        else: ltext(d,W-m-int(28*s),gy+int(18*s),">",f(int(30*s),False),FAINT)
        gy+=ch+gap
    # CTA
    cty=gy+int(10*s); grad_box(img,[m,cty,W-m,cty+int(58*s)],(124,92,255),(91,141,239))
    ctext(d,W/2,cty+int(16*s),"Continue  →  Missing",f(int(18*s)),(255,255,255))
    return img

def wordle(W,H):
    img=bg(W,H); d=ImageDraw.Draw(img); s=W/430.0; m=int(W*0.06)
    ctext(d,W/2,int(H*0.05),"Wordle",f(int(24*s)),TXT); ctext(d,W/2,int(H*0.05)+int(30*s),"Guess the 5-letter word",f(int(13*s),False),FAINT)
    rows=[("SLATE","xxggx"),("BRAVE","xgxgg"),("CRAVE","ggggg")]
    tile=min(int((W-2*m-4*int(7*s))/5),int(56*s)); gap=int(7*s); gw=5*tile+4*gap; gx=(W-gw)//2; gy=int(H*0.16)
    for r in range(6):
        for c in range(5):
            x=gx+c*(tile+gap); y=gy+r*(tile+gap); st=rows[r][1][c] if r<len(rows) else '.'
            fill={'g':CORRECT,'y':PRESENT,'x':ABSENT}.get(st);
            if fill: d.rounded_rectangle([x,y,x+tile,y+tile],radius=int(6*s),fill=fill)
            else: d.rounded_rectangle([x,y,x+tile,y+tile],radius=int(6*s),outline=HAIR,width=2)
            if r<len(rows): ctext(d,x+tile/2,y+tile*0.16,rows[r][0][c],f(int(tile*0.5)),(255,255,255))
    # keyboard
    kbrows=["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"]; ky=int(H*0.78); kh=int(48*s)
    for row in kbrows:
        n=len(row); kw=int((W-2*m-(n-1)*int(5*s))/max(10,n)); tot=n*kw+(n-1)*int(5*s); kx=(W-tot)//2
        for ch in row:
            d.rounded_rectangle([kx,ky,kx+kw,ky+kh],radius=int(6*s),fill=SURF_HI); ctext(d,kx+kw/2,ky+int(12*s),ch,f(int(16*s)),TXT); kx+=kw+int(5*s)
        ky+=kh+int(7*s)
    return img

def scramble(W,H):
    img=bg(W,H); d=ImageDraw.Draw(img); s=W/430.0
    ctext(d,W/2,int(H*0.05),"Scramble",f(int(24*s)),TXT); ctext(d,W/2,int(H*0.05)+int(30*s),"Unscramble the word",f(int(13*s),False),FAINT)
    ctext(d,W/2,int(H*0.13),"5 letters",f(int(14*s),False),FAINT)
    slots="TIG__"; sw=int(54*s); gap=int(8*s); tot=5*sw+4*gap; sx=(W-tot)//2; sy=int(H*0.20)
    for i in range(5):
        x=sx+i*(sw+gap); d.rounded_rectangle([x,sy,x+sw,sy+int(62*s)],radius=int(6*s),outline=GH["scramble"] if slots[i]=="_" else HAIR,width=2)
        if slots[i]!="_": ctext(d,x+sw/2,sy+int(12*s),slots[i],f(int(30*s)),(255,255,255))
    pool=["G","T","E","I","R"]; py=int(H*0.40)
    for i,ch in enumerate(pool):
        cw=int(58*s); tot=5*cw+4*int(10*s); px=(W-tot)//2+i*(cw+int(10*s))
        used=ch in ["T","I","G"]
        d.rounded_rectangle([px,py,px+cw,py+int(66*s)],radius=int(14*s),fill=("#00000000" if used else SURF_HI) if False else (SURF if used else SURF_HI),outline=HAIR,width=2)
        ctext(d,px+cw/2,py+int(15*s),ch,f(int(30*s)),FAINT if used else (255,255,255))
    # buttons
    by=int(H*0.80); bw=(W-int(W*0.12)-int(12*s))/2; m=int(W*0.06)
    d.rounded_rectangle([m,by,m+bw,by+int(52*s)],radius=int(26*s),outline=HAIR,width=2); ctext(d,m+bw/2,by+int(15*s),"Hint",f(int(16*s)),DIM)
    grad_box(img,[m+bw+int(12*s),by,W-m,by+int(52*s)],(124,58,237),(168,85,247)); ctext(d,m+bw+int(12*s)+bw/2,by+int(15*s),"Submit",f(int(16*s)),(255,255,255))
    return img

def blitz(W,H):
    img=bg(W,H); d=ImageDraw.Draw(img); s=W/430.0; m=int(W*0.06)
    ctext(d,W/2,int(H*0.05),"Blitz",f(int(24*s)),TXT); ctext(d,W/2,int(H*0.05)+int(30*s),"Most words in 60s",f(int(13*s),False),FAINT)
    ltext(d,W-m-int(50*s),int(H*0.05),"47",f(int(20*s)),GH["blitz"])
    # timer
    ty=int(H*0.14); d.rounded_rectangle([m,ty,W-m,ty+int(8*s)],radius=int(4*s),fill=HAIR); d.rounded_rectangle([m,ty,m+int((W-2*m)*0.7),ty+int(8*s)],radius=int(4*s),fill=GH["blitz"])
    ctext(d,W/2,int(H*0.19),"CRATES",f(int(34*s)),TXT)
    letters=["P","I","C","T","U","R","E"]; py=int(H*0.30)
    cw=int(50*s); tot=7*cw+6*int(9*s); px0=(W-tot)//2
    for i,ch in enumerate(letters):
        px=px0+i*(cw+int(9*s)); d.rounded_rectangle([px,py,px+cw,py+int(58*s)],radius=int(14*s),fill=SURF_HI,outline=HAIR,width=2); ctext(d,px+cw/2,py+int(13*s),ch,f(int(26*s)),(255,255,255))
    by=int(H*0.44); bw=(W-2*m);
    grad_box(img,[m,by,W-m,by+int(52*s)],(225,29,72),(251,113,133)); ctext(d,W/2,by+int(15*s),"Enter",f(int(16*s)),(255,255,255))
    ltext(d,m,int(H*0.56),"9 words",f(int(14*s)),FAINT)
    words=["price","cure","trip","cite","erupt","recruit","picture","true","ripe"]; wy=int(H*0.60); wx=m
    for w in words:
        b=d.textbbox((0,0),w.upper(),font=f(int(13*s))); pw=(b[2]-b[0])+int(24*s)
        if wx+pw>W-m: wx=m; wy+=int(42*s)
        d.rounded_rectangle([wx,wy,wx+pw,wy+int(32*s)],radius=int(16*s),fill=SURF,outline=HAIR,width=1); ctext(d,wx+pw/2,wy+int(8*s),w.upper(),f(int(13*s)),DIM); wx+=pw+int(8*s)
    return img

os.makedirs("screenshots",exist_ok=True)
SIZES={"iphone65":(1242,2688),"ipad13":(2064,2752)}
SCREENS={"1hub":hub,"2wordle":wordle,"3scramble":scramble,"4blitz":blitz}
n=0
for nm,(W,H) in SIZES.items():
    for sn,fn in SCREENS.items():
        fn(W,H).save(f"screenshots/{nm}_{sn}.png"); n+=1
print("generated",n,"screenshots")
