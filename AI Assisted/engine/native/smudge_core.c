/* Shared image-processing core. NBIS provides extraction and matching. */
#include "smudge.h"
#include <math.h>
#include <stdlib.h>
#include <string.h>
#define PI 3.14159265358979323846
static int clampi(int v,int lo,int hi){return v<lo?lo:v>hi?hi:v;}
static float clampf(float v,float lo,float hi){return v<lo?lo:v>hi?hi:v;}
static unsigned char byte(float v){return (unsigned char)clampi((int)lrintf(v),0,255);}

void sm_orientation(const uint8_t *im,int w,int h,int bs,float *theta,float *coh){
 int bw=(w+bs-1)/bs,bh=(h+bs-1)/bs;
 for(int by=0;by<bh;by++)for(int bx=0;bx<bw;bx++){
  double a=0,b=0,c=0;
  for(int y=by*bs+1;y<(by+1)*bs&&y<h-1;y++)for(int x=bx*bs+1;x<(bx+1)*bs&&x<w-1;x++){
   float gx=im[y*w+x+1]-im[y*w+x-1],gy=im[(y+1)*w+x]-im[(y-1)*w+x];
   a+=gx*gx-gy*gy;b+=2*gx*gy;c+=gx*gx+gy*gy;
  }
  int k=by*bw+bx; float t=(atan2(b,a)+PI)/2;
  theta[k]=t>=PI?t-PI:t;coh[k]=c>1?sqrt(a*a+b*b)/c:0;
 }
}
void sm_ridge_period(const uint8_t *im,int w,int h,int bs,const float *theta,float *period){
 int bw=(w+bs-1)/bs,bh=(h+bs-1)/bs;
 for(int by=0;by<bh;by++)for(int bx=0;bx<bw;bx++){
  int k=by*bw+bx,cx=bx*bs+bs/2,cy=by*bs+bs/2; float nx=-sinf(theta[k]),ny=cosf(theta[k]),v[32];
  for(int t=0;t<32;t++){
   float sum=0;
   for(int q=-4;q<=4;q++){
    int x=clampi(lrintf(cx+(t-16)*nx+q*ny),0,w-1),y=clampi(lrintf(cy+(t-16)*ny-q*nx),0,h-1);sum+=im[y*w+x];
   }v[t]=sum/9;
  }
  float mean=0;for(int t=0;t<32;t++)mean+=v[t]/32;
  for(int t=0;t<32;t++)v[t]-=mean;
  float best=-1;int lagbest=0;
  for(int lag=4;lag<=14;lag++){
   double ac=0,aa=0,bb=0;for(int t=0;t<32-lag;t++){ac+=v[t]*v[t+lag];aa+=v[t]*v[t];bb+=v[t+lag]*v[t+lag];}
   float r=aa*bb>1?ac/sqrt(aa*bb):0;
   if(r>best){best=r;lagbest=lag;}
  }period[k]=best>0.25?lagbest:0;
 }
}
void sm_clahe(const uint8_t *im,int w,int h,int tx,int ty,float clip,uint8_t *out){
 tx=clampi(tx,1,w);ty=clampi(ty,1,h);uint8_t *maps=malloc(tx*ty*256);if(!maps){memcpy(out,im,w*h);return;}
 for(int iy=0;iy<ty;iy++)for(int ix=0;ix<tx;ix++){
  int hist[256]={0},x0=ix*w/tx,x1=(ix+1)*w/tx,y0=iy*h/ty,y1=(iy+1)*h/ty,n=(x1-x0)*(y1-y0);
  for(int y=y0;y<y1;y++)for(int x=x0;x<x1;x++)hist[im[y*w+x]]++;
  int limit=fmaxf(1,clip*n/256),ex=0;
  for(int i=0;i<256;i++)if(hist[i]>limit){ex+=hist[i]-limit;hist[i]=limit;}
  for(int i=0;i<256;i++)hist[i]+=ex/256+(i<ex%256);
  int cdf=0;for(int i=0;i<256;i++){cdf+=hist[i];maps[(iy*tx+ix)*256+i]=byte(255.0*cdf/n);}
 }
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){
  float fx=(x+.5f)*tx/w-.5f,fy=(y+.5f)*ty/h-.5f;int ix=floorf(fx),iy=floorf(fy);float ax=fx-ix,ay=fy-iy;
  int x0=clampi(ix,0,tx-1),x1=clampi(ix+1,0,tx-1),y0=clampi(iy,0,ty-1),y1=clampi(iy+1,0,ty-1),v=im[y*w+x];
  out[y*w+x]=byte((1-ay)*((1-ax)*maps[(y0*tx+x0)*256+v]+ax*maps[(y0*tx+x1)*256+v])+ay*((1-ax)*maps[(y1*tx+x0)*256+v]+ax*maps[(y1*tx+x1)*256+v]));
 }free(maps);
}
void sm_gabor(const uint8_t *im,int w,int h,int bs,const float *theta,const float *period,const uint8_t *mask,uint8_t *out){
 int bw=(w+bs-1)/bs;
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){
  int k=(y/bs)*bw+x/bs;if((mask&&!mask[k])||period[k]<3){out[y*w+x]=255;continue;}
  float t=theta[k],p=period[k],sum=0,norm=0;int radius=clampi((int)p,4,9);
  for(int j=-radius;j<=radius;j++)for(int i=-radius;i<=radius;i++){
   float u=-i*sinf(t)+j*cosf(t),v=i*cosf(t)+j*sinf(t);
   float g=expf(-(u*u+0.5f*v*v)/(p*p*.5f)),f=g*cosf(2*PI*u/p);
   sum+=(im[clampi(y+j,0,h-1)*w+clampi(x+i,0,w-1)]-128)*f;norm+=fabsf(f);
  }out[y*w+x]=byte(128+4*sum/fmaxf(norm,1));
 }
}
static float sinc(float x){return fabsf(x)<1e-5?1:sinf(PI*x)/(PI*x);}
void sm_resize(const uint8_t *im,int w,int h,uint8_t *out,int ow,int oh){
 for(int y=0;y<oh;y++)for(int x=0;x<ow;x++){
  float sx=(x+.5f)*w/ow-.5f,sy=(y+.5f)*h/oh-.5f,sum=0,weight=0;
  int ix=floorf(sx),iy=floorf(sy);
  for(int j=iy-2;j<=iy+3;j++)for(int i=ix-2;i<=ix+3;i++){
   float dx=sx-i,dy=sy-j,v=sinc(dx)*sinc(dx/3)*sinc(dy)*sinc(dy/3);
   sum+=im[clampi(j,0,h-1)*w+clampi(i,0,w-1)]*v;weight+=v;
  }out[y*ow+x]=byte(sum/fmaxf(weight,.001f));
 }
}
static void gaussian(const uint8_t *im,int w,int h,float sigma,float *out){
 int r=clampi(ceilf(sigma*3),1,24);float kernel[49],norm=0;float *tmp=malloc(w*h*sizeof(float));
 if(!tmp){for(int i=0;i<w*h;i++)out[i]=im[i];return;}
 for(int i=-r;i<=r;i++){kernel[i+r]=expf(-i*i/(2*sigma*sigma));norm+=kernel[i+r];}
 for(int i=0;i<=2*r;i++)kernel[i]/=norm;
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){float s=0;for(int i=-r;i<=r;i++)s+=kernel[i+r]*im[y*w+clampi(x+i,0,w-1)];tmp[y*w+x]=s;}
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){float s=0;for(int i=-r;i<=r;i++)s+=kernel[i+r]*tmp[clampi(y+i,0,h-1)*w+x];out[y*w+x]=s;}
 free(tmp);
}
void sm_unsharp(const uint8_t *im,int w,int h,float sigma,float amount,uint8_t *out){
 float *blur=malloc(w*h*sizeof(float));if(!blur){memcpy(out,im,w*h);return;}gaussian(im,w,h,fmaxf(sigma,.1f),blur);
 for(int i=0;i<w*h;i++)out[i]=byte(im[i]+amount*(im[i]-blur[i]));free(blur);
}
double sm_ssim(const uint8_t *a,const uint8_t *b,int w,int h){
 /* Gaussian local moments, 11x11, sigma 1.5. */
 double total=0;int n=0;float kernel[11],kn=0;
 for(int i=-5;i<=5;i++){kernel[i+5]=expf(-i*i/4.5f);kn+=kernel[i+5];}
 for(int i=0;i<11;i++)kernel[i]/=kn;
 /* Sample every second centre on large images to bound evaluation cost. */
 int step=w*h>262144?2:1;
 for(int y=0;y<h;y+=step)for(int x=0;x<w;x+=step){
  double ma=0,mb=0,aa=0,bb=0,ab=0;
  for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){
   int k=clampi(y+j,0,h-1)*w+clampi(x+i,0,w-1);double z=kernel[i+5]*kernel[j+5],av=a[k],bv=b[k];
   ma+=z*av;mb+=z*bv;aa+=z*av*av;bb+=z*bv*bv;ab+=z*av*bv;
  }
  double va=fmax(aa-ma*ma,0),vb=fmax(bb-mb*mb,0),cov=ab-ma*mb;
  total+=((2*ma*mb+6.5025)*(2*cov+58.5225))/((ma*ma+mb*mb+6.5025)*(va+vb+58.5225));n++;
 }return n?total/n:1;
}
int sm_analyze(const uint8_t *roi,int w,int h,float ppi,SmMinutia *out,int max_out,SmPrintInfo *info){
 if(w<32||h<32||w>4096||h>4096||max_out<=0)return -1;
 memset(info,0,sizeof(*info));float scale=clampf(500/fmaxf(ppi,50),.25f,4);
 if(fmaxf(w,h)*scale>512)scale=512/fmaxf(w,h);
 int ow=fmaxf(64,lrintf(w*scale)),oh=fmaxf(64,lrintf(h*scale)),n=ow*oh,bs=16,bw=(ow+15)/16,bh=(oh+15)/16,nb=bw*bh;
 uint8_t *im=malloc(n),*eq=malloc(n),*enh=malloc(n),*mask=malloc(nb);
 float *theta=malloc(nb*4),*coh=malloc(nb*4),*period=malloc(nb*4);
 if(!im||!eq||!enh||!mask||!theta||!coh||!period){free(im);free(eq);free(enh);free(mask);free(theta);free(coh);free(period);return -2;}
 sm_resize(roi,w,h,im,ow,oh);sm_clahe(im,ow,oh,8,8,2,eq);sm_orientation(eq,ow,oh,bs,theta,coh);sm_ridge_period(eq,ow,oh,bs,theta,period);
 float cs=0,ps=0;int coherent=0,pc=0;
 for(int i=0;i<nb;i++){mask[i]=coh[i]>.25&&period[i]>0;coherent+=mask[i];cs+=coh[i];if(period[i]>0){ps+=period[i];pc++;}}
 sm_gabor(eq,ow,oh,bs,theta,period,mask,enh);
 SmMinutia *candidate=malloc(SM_MAX_MINUTIAE*sizeof(SmMinutia));float feats[11];int hist[5],best=-1,bhq=-1,pol=0;
 /* Raw + contrast-enhanced + Gabor, both polarities: don't discard usable raw detail. */
 for(int mode=0;candidate&&mode<3;mode++)for(int inv=0;inv<2;inv++){
  const uint8_t *base=mode==0?im:mode==1?eq:enh;uint8_t *input=malloc(n);if(!input)continue;
  for(int i=0;i<n;i++)input[i]=inv?255-base[i]:base[i];
  int count=sm_mindtct(input,ow,oh,500,candidate,SM_MAX_MINUTIAE,feats,hist);free(input);
  int hq=0;for(int j=0;j<count;j++)hq+=candidate[j].reliability>=.5f;
  if(count>=0&&(hq>bhq||(hq==bhq&&count>best))){best=count<max_out?count:max_out;bhq=hq;pol=inv;memcpy(out,candidate,best*sizeof(SmMinutia));memcpy(info->nfiq_feats,feats,sizeof(feats));}
 }
 info->n_minutiae=best>0?best:0;info->n_hq=bhq>0?bhq:0;info->polarity=pol;info->work_w=ow;info->work_h=oh;info->scale=scale;
 info->coherent_frac=(float)coherent/nb;info->mean_coherence=cs/nb;info->ridge_period=pc?ps/pc:0;
 info->nfiq_style=clampi(5-info->n_hq/8,1,5);
 /* Actual resize ratio includes minimum-size and rounding corrections. */
 for(int i=0;i<best;i++){out[i].x*= (float)w/ow;out[i].y*= (float)h/oh;}
 free(im);free(eq);free(enh);free(mask);free(theta);free(coh);free(period);free(candidate);return best<0?best:info->n_minutiae;
}
/* Iterative radix-2 FFT, 32 samples, in-place. */
static void fft(float *re,float *im,int inverse){
 for(int i=1,j=0;i<32;i++){int bit=16;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){float t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}}
 for(int len=2;len<=32;len*=2){float angle=(inverse?2:-2)*PI/len;
  for(int i=0;i<32;i+=len)for(int j=0;j<len/2;j++){float c=cosf(angle*j),s=sinf(angle*j);int a=i+j,b=a+len/2;float tr=c*re[b]-s*im[b],ti=s*re[b]+c*im[b];re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;}}
 if(inverse)for(int i=0;i<32;i++){re[i]/=32;im[i]/=32;}
}
static void fft2(float *re,float *im,int inverse){
 float r[32],q[32];for(int y=0;y<32;y++)fft(re+y*32,im+y*32,inverse);
 for(int x=0;x<32;x++){for(int y=0;y<32;y++){r[y]=re[y*32+x];q[y]=im[y*32+x];}fft(r,q,inverse);for(int y=0;y<32;y++){re[y*32+x]=r[y];im[y*32+x]=q[y];}}
}
void sm_smudge(const uint8_t *in,int w,int h,const uint8_t *alpha,float strength,float lo,float hi,float noise,uint32_t seed,uint8_t *out){
 if(strength<=0){memcpy(out,in,(size_t)w*h);return;}
 int n=w*h;float *sum=calloc(n,sizeof(float)),*weight=calloc(n,sizeof(float)),*blur=malloc(n*sizeof(float));
 if(!sum||!weight||!blur){memcpy(out,in,n);free(sum);free(weight);free(blur);return;}
 strength=clampf(strength,0,1);lo=fmaxf(lo,2);hi=fmaxf(hi,lo+1);gaussian(in,w,h,hi*.8f,blur);
 for(int by=-16;by<h;by+=16)for(int bx=-16;bx<w;bx+=16){
  float re[1024],im[1024]={0};double a=0,b=0;
  for(int j=0;j<32;j++)for(int i=0;i<32;i++){
   int x=clampi(bx+i,0,w-1),y=clampi(by+j,0,h-1),k=y*w+x;
   float gx=in[y*w+clampi(x+1,0,w-1)]-in[y*w+clampi(x-1,0,w-1)],gy=in[clampi(y+1,0,h-1)*w+x]-in[clampi(y-1,0,h-1)*w+x];a+=gx*gx-gy*gy;b+=2*gx*gy;
   float win=sinf(PI*(i+.5f)/32)*sinf(PI*(j+.5f)/32);re[j*32+i]=in[k]*win;
  }
  float normal=atan2(b,a)/2;fft2(re,im,0);
  for(int j=0;j<32;j++)for(int i=0;i<32;i++){
   float u=(i<=16?i:i-32)/32.0f,v=(j<=16?j:j-32)/32.0f,f=sqrtf(u*u+v*v);
   if(f>0){float angle=atan2f(v,u),alignment=fabsf(cosf(angle-normal));float band=expf(-powf((f-(1/lo+1/hi)/2)/fmaxf((1/lo-1/hi)*.8f,.02f),4));
    float gain=1-strength*band*(.6f+.4f*alignment);re[j*32+i]*=gain;im[j*32+i]*=gain;}
  }fft2(re,im,1);
  for(int j=0;j<32;j++)for(int i=0;i<32;i++){int x=bx+i,y=by+j;if(x<0||x>=w||y<0||y>=h)continue;float win=sinf(PI*(i+.5f)/32)*sinf(PI*(j+.5f)/32);sum[y*w+x]+=re[j*32+i]*win;weight[y*w+x]+=win*win;}
 }
 for(int i=0;i<n;i++){
  if(!alpha||alpha[i]){
   seed^=seed<<13;seed^=seed>>17;seed^=seed<<5;float rnd=((seed&65535)/65535.f-.5f)*noise;
   float filtered=sum[i]/fmaxf(weight[i],.001f);
   /* At the cap, remove surviving high-frequency detail with a low-pass fallback. */
   float cap=clampf((strength-.55f)/.45f,0,1),v=filtered*(1-cap)+blur[i]*cap+rnd;
   float m=(alpha?alpha[i]/255.f:1);out[i]=byte(in[i]*(1-m)+v*m);
  }else out[i]=in[i];
 }free(sum);free(weight);free(blur);
}
