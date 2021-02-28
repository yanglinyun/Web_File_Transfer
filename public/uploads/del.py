import os
import time
import datetime
t = time.time()
t = (int(round(t * 1000)))
dirpath = './'
for root,dirs,files in os.walk(dirpath):
    for file in files:
       path = os.path.join(root,file)
       print(path+"\n")

       try:
       	  oldT = int(path.split("-")[1])
       except:
          continue     
       print(t,oldT,t-oldT)  
       if(t - oldT > 1000*3600*3):
           os.remove(path)
