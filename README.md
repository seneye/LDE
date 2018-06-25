# Local Data Exchange

The seneye Local Data Exchange (LDE) enables a seneye USB device (SUD) to transmit data to a 3rd party URL, via a seneye Web Server (SWS) or the seneye Connect Application (SCA), with or without internet connection.

An HTTP POST request is issued by a SWS or SCA to a single URL. The content of the request is digitally signed and contains the device description, the result of the measurements, and warning states. The latest reading from the device will be posted. This allows you to view/log data locally, and/or remotely to your own server, for example.

The seneye LDE uses JSON Web Tokens (JWT) to transmit data.

This repository contains documentation explaining how to enable the LDE, as well as documented example code that demonstrates methods for handling LDE requests sent by your SWS or SCA.

*Please note: no direct support is offered from seneye for development beyond the information in this repository. seneye provides examples as reference only and as such, warranties are not provided for their use and functionality. Please see [Terms of Use](#terms-of-use).*

# Enabling the LDE

A SWS or SCA must first be configured for LDE.

1. Navigate to the **Settings** panel of your SWS GUI or SCA.  
You will need your SWS Pin to access the SWS GUI. Click [here](http://answers.seneye.com/en/Seneye_Products/sws/instructions/TroubleShooting/How_to_find_your_SWS_ID_and_Pin) for help locating your pin.

2. Under **Developer settings** tick the box for **Enable Local Data Exchange**.

3. Make note of the **Secret Key**. You will need this later for verification of the LDE HTTP request body.

4. Enter a URL for where the SWS/SCA will send data to.  
   Example: ```http://"IPaddress":7878/localexchange/endpoint```

3. Click **Ok/Save**.

Readings will now be sent to the specified URL in addition to the seneye cloud whenever a reading is taken.

# Data Specification

The LDE makes use of JSON Web Tokens (JWT) to digitally sign the transmitted data and help ensure validity and integrity.

You can learn more about JWT [here](https://jwt.io/introduction/).

This means LDE request bodies are comprised of three Base64Url encoded parts; the JWT header, payload, and signature, separated by dots.

For example:

    xxxx.yyyy.zzzz

### Header

The header part contains the hashing algorithm being used: HS256 (HMAC with SHA-256).

```json
{
  "alg": "HS256"
}
```
### Payload
SUD information and measurements data are contained in the payload part.

```json
{  
   "ver":"1.0.0",
   "SUD":{  
      "id":"F5001E4050F9D1B6AE0B84A60D002004",
      "name":"SUD Device",
      "type":3,
      "TS":1486116880,
      "data":{  
         "S":{  
            "W":1,
            "T":0,
            "P":0,
            "N":0,
            "S":0,
            "K":0
         },
         "T":26.125,
         "P":8.66,
         "N":0.010,
         "K":0,
         "L":0,
         "A":0
      }
   }
}
```
### Payload JSON description

```ver``` - Version number

```SUD``` - Contains SUD description, and data object

|  Key    |   Description  | 
|---------|:---------------|
|   id    | SUD serial number        | 
|   name  | SUD name     | 
|   type  | SUD type [1 : Home] [2 : Pond] [3 : Reef ]           | 
|   TS    | Time of reading as Unix time-stamp          | 
|   data  | SUD data         | 

```data``` - Contains SUD status flags and experiment readings

|  Key    |   Description  | Data Type
|---------|:---------------|:---------
|   S     | SUD Status        |   JSON object
|   T     | Temperature     | Float
|   P     | pH - missing if slide error    | Float 
|   N     | NH3 - missing if slide error   | Float
|   K     | Kelvin   - Reef only        | Integer
|   L     | Lux       - Reef only | Integer
|   A     | PAR       - Reef only  | Integer

```K``` - Numeric CCT value of the colour temperature in degrees Kelvin. 0 indicates the value is not a valid Kelvin. If this occurs the Kelvin status flag will be 1.  
If the value is not a valid Kelvin this means the color of the light does not fit to the Kelvin line 
on the [CIE colourspace](http://answers.seneye.com/en/Seneye_Products/seneye_USB_device/seneye_reef_light_meter_functions/no_kelvin_on_light_readings).

```S``` - SUD status flags

|  Key    |   Description  | Value: 0       | Value: 1      |
|---------|:---------------|:---------------|:--------------|
|   W     | Water          | Out of water       | In water
|   T     | Temperature    | Within limits  | Outside limits
|   P     | pH             | Within limits  | Outside limits
|   N     | NH3            | Within limits  | Outside limits
|   S     | Slide          | Slide OK       | Slide expired / not fitted
|   K     | Kelvin         | Is a Kelvin    | Not a kelvin

### Signature

As per the JWT standard, the signature part is created by taking the encoded header, the encoded payload, the secret key from your SWS/SCA GUI, the algorithm specified in the header, and signing it.

```
  HMACSHA256(
    base64UrlEncode(header) + "." +
    base64UrlEncode(payload),
    secret)
```
The signature is used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way. 

# Example Code - Quick Start Guide

Source code for a Node.js application is provided as an example for handling LDE requests. VSCode project files are also provided to simplify running the example code.  

The example Node.js application listens for incoming LDE requests and displays the data as simple formatted HTML for local clients.
Communication between server and clients is achieved via HTML5 WebSockets.

*Please note: the example code is for reference only and seneye does not offer support for further implementation.*
*Please see [Terms of Use](#terms-of-use)*.

## 1. Update the list of known LDE devices

After downloading the example code, you must make some changes specific to your SWS or SCA. 

Since messages from devices are digitally signed, you will need to edit a config file - ```/config/default.json``` - to include the source ID and secret key for each SWS or SCA that is configured for LDE.

Use these links for help locating your SWS or SCA ID:   
[Locate SWS ID](http://answers.seneye.com/en/Seneye_Products/sws/instructions/TroubleShooting/How_to_find_your_SWS_ID_and_Pin).  
[Locate SCA ID](http://answers.seneye.com/en/Seneye_Products/SCA_Version_2_information/SCA_V2_%22support_ID%22).

Secret keys are located in the Settings panel of your SWS/SCA GUI.

**If you cannot locate your ID or secret key please contact [seneye support](mailto:seneye@support.com).**

*NOTE - a single seneye Connect Application (SCA) can operate with multiple SUDs and their data will be signed using the same ID and secret key.*

Amend the config file with the gathered information like so: 
```json
{
  "KnownSources": [
    {"source": "SCA_rVYGiME5tYrf", "secret": "FGQEEESSA"},
    {"source": "SWS_pLJfM7hEnrFP", "secret": "MDUELFPLL"},

    ... 
  ]
} 
```
The source ID string must be prepended with the source type, for example: ```"SCA_"``` or ```"SWS_"```.

## 2. Run the application

To run the example code type these commands into a shell from the VSCode project directory.

```node
npm install
npm start
```

*NOTE - Node.js needs to be installed on the machine.*

# Terms of Use

_THE SAMPLE CODE IS PROVIDED “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PAGERDUTY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE._

_The Code is not covered by any Seneye Service Level Agreements._
