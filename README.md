> [!WARNING]
> This script is under active development, expect some bugs.

# ofdldrm (Onlyfans Download DRM)
**Download all media from OnlyFans subscriptions, including DRM protected videos (requires [ffmpeg](https://ffmpeg.org/download.html))**

[Download](https://github.com/ztkw/ofdldrm/releases) the executable compatible with your operating system:

- For windows : ofdldrm-win-x64.exe
- For linux : ofdldrm-linux-x64
- For new Mac M1/M2 : ofdldrm-macos-arm64
- For old Mac (Intel) : ofdldrm-macos-x64

Open a new terminal inside the directory where the executable is located.  
Run the executable with `./ofdldrm-win-x64.exe` (on windows) or `./ofdldrm-****` (on Mac/linux)  
A new file `auth.json` will be created next to the executable.
```
{
  "AUTH_ID": "",
  "USER_AGENT": "",
  "SESS": "",
  "XBC": ""
}
```

Fill in your information, for example :
```
{
  "AUTH_ID": "12345678",
  "USER_AGENT": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "SESS": "394jdk92jdpskd0322dlfp23sm",
  "XBC": "0a38948272342038jd32b8sl932982391z32k909"
}
```

This information can be found on onlyfans.com :
1. Go to onlyfans.com and login
2. Press F12 to open the developer tab
3. Click on the Network tab
4. Refresh the page
5. In the requests list, find and click on the request named 'me'
6. Find the 4 variables as shown in the screenshot below
   
![image](https://github.com/ztkw/ofdldrm/blob/main/authinfo.png)

After copy/pasting the 4 variables into the `auth.json` file, re-run the executable with `./ofdldrm-win-x64.exe` (windows) or `./ofdldrm-****` (on Mac/linux)  

All the media will be downloaded to a new folder named `downloads` next to the executable.  

A progress bar will show the download progress.  

Enjoy !
