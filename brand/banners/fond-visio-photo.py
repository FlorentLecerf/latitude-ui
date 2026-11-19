import sys, numpy as np
# Fond virtuel de visio (Meet, Zoom) : photo de loft + logo « Latitude. » en néon (halo chaud, point terracotta).
# Photo : Unsplash eHD8Y1Znfpk (licence Unsplash, usage commercial libre, sans attribution) :
#   curl -sL -o loft.jpg 'https://unsplash.com/photos/eHD8Y1Znfpk/download?force=true'
# Rendu validé : python3 fond-visio-photo.py 1362 552 285 fond-visio-loft.jpg 0 221 loft.jpg
#   (centre x, centre y, largeur du logo, sortie, coin du recadrage 1920x1080, photo source)
# Le logo est à droite du centre, au-dessus de l'écran du mur du fond : la tête de Florent ne le cache pas.
# Sortie déposée sur Drive 04_IDENTITE-MARQUE/Social/fond-visio-loft.jpg (1920x1080).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
FONT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','tools','fonts','DMSerifDisplay-Regular.ttf')
src=Image.open(sys.argv[7]).convert('RGB')
cx,cy,width=int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3]); out=sys.argv[4]
S=4  # supersampling
f=ImageFont.truetype(FONT,200*S)
w1=f.getlength('Latitude'); wd=f.getlength('.')
scale=width*S/(w1+wd); f=ImageFont.truetype(FONT,int(200*S*scale))
w1=f.getlength('Latitude'); wd=f.getlength('.')
asc,desc=f.getmetrics(); W=int(w1+wd)+40*S; H=asc+desc+40*S
mt=Image.new('L',(W,H),0); md=Image.new('L',(W,H),0)
ImageDraw.Draw(mt).text((20*S,20*S),'Latitude',font=f,fill=255)
ImageDraw.Draw(md).text((20*S+w1,20*S),'.',font=f,fill=255)
mt=mt.resize((W//S,H//S),Image.LANCZOS); md=md.resize((W//S,H//S),Image.LANCZOS)
w,h=mt.size; ox,oy=cx-w//2,cy-h//2
base=np.array(src).astype(np.float32)/255
def layer(mask,col,blurs):
    acc=np.zeros(base.shape,np.float32)
    big=Image.new('L',(src.width,src.height),0); big.paste(mask,(ox,oy))
    for r,k in blurs:
        m=np.array(big.filter(ImageFilter.GaussianBlur(r)) if r else big).astype(np.float32)/255
        acc+=m[:,:,None]*np.array(col,np.float32)[None,None,:]*k
    return acc
warm=(1.0,0.93,0.84); terra=(224/255,120/255,85/255)
glow=layer(mt,warm,[(3,0.65),(10,0.55),(28,0.42),(70,0.28)])+layer(md,terra,[(3,0.8),(10,0.7),(28,0.5),(70,0.3)])
# scene grade: a touch darker and warmer so the light reads
g=base*0.86; g[:,:,0]*=1.02; g[:,:,2]*=0.97
img=1-(1-g)*(1-np.clip(glow,0,1))   # screen blend for the halo
# the tubes themselves: bright core
big=Image.new('L',(src.width,src.height),0); big.paste(mt,(ox,oy)); mtc=np.array(big).astype(np.float32)/255
big=Image.new('L',(src.width,src.height),0); big.paste(md,(ox,oy)); mdc=np.array(big).astype(np.float32)/255
core_t=np.array((1.0,0.98,0.94)); core_d=np.array((1.0,0.62,0.48))
img=img*(1-mtc[:,:,None])+core_t*mtc[:,:,None]
img=img*(1-mdc[:,:,None])+core_d*mdc[:,:,None]
im=Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8))
x0,y0=int(sys.argv[5]),int(sys.argv[6])
im=im.crop((x0,y0,x0+1920,y0+1080)).filter(ImageFilter.GaussianBlur(1.1))
# vignette
yy,xx=np.mgrid[0:1080,0:1920]; v=1-0.18*(((xx-960)/960)**2+((yy-540)/540)**2)/2
a=np.array(im).astype(np.float32)*v[:,:,None]
Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(out,quality=95)
