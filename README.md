# ofdldrm
**Download all media from an OnlyFans account active subscriptions, including DRM protected videos.**

> [!NOTE]
> The script is compiled into a single executable.  
> No installation is required

Just download the executable compatible with your operating system:

- For windows : ofdldrm-win-x64.exe
- For linux : ofdldrm-linux-x64
- For new Mac M1/M2 : ofdldrm-macos-arm64
- For old Mac (Intel) : ofdldrm-macos-x64

Open a terminal in the directory where the executable is located.  
Run the executable with `./ofdldrm-win-x64.exe` (windows) or `./ofdldrm-****` (on Mac/linux)  
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
6. On the tab that just opened, click on the Headers tab
7. Find 'X-BC' at the bottom
8. Find the 'User-Agent'
9. Find 'auth_id' and 'sess' inside the Cookie variable

After filling the information inside the `auth.json` file, re-run the executable with `./ofdldrm-win-x64.exe` (windows) or `./ofdldrm-****` (on Mac/linux)

All the media will be downloaded to a new folder named `downloads` next to the executable.

A progress bar will show the download progress.
