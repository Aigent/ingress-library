# Aigent Ingress API 


The Aigent api is available at:  wss://ingress.aigent.ai/connector


### How to run the full example

clone the repository to your local

`git clone https://github.com/Aigent/ingress-library.git`





# Requirements

A signed certificate by Aigent.

The private key with which the  CSR Certificate Signing Request was made.

in order to create a certificate you need to run the following command. 

How to obtain a certificate from Aigent:

Email the Certificate Signing Request(CSR) to  help@aigent.ai


# Library

We provide a library that can be used to integrate 

The library can be found:https://github.com/Aigent/ingress-library/blob/master/js/AigentConnector.js 

An example implementation can be found here: 

https://github.com/Aigent/ingress-library/blob/master/js/test.js 

The connection is done using websockets.

We establish the connection using the certificates for authentication

        this.socket = new WebSocket(uri, {
             cert: fs.readFileSync("client.crt"),
             key: fs.readFileSync("client.key"),
        });



2 Streams are required in order to establish a call:

1 stream for the agent

1 stream for the client  

## Data Format

The data is expected to be in the following format:

an Uint8 array with the following data: `[ code, code, timestamp, timestamp, timestamp, timestamp,  payload…]`


```
/**
  * @tag AigentConnector
 * @summary prepare the given payload for send
 * @description Uses internally by send method
 * @param {code} integer. Message type id
 * @param {payload} Uint8Array. Data being sent
 * @response Uint8Array encoded message
 */
 const timestampArrayLength = 4;
function encode(code, payload) {
    const binCode = new Uint8Array([code & 0x00ff, (code & 0xff00) >> 8]);
    const binMsg = new Uint8Array(binCode.byteLength + timestampArrayLength + payload.byteLength);
    const timestampArray = generateTimestampArray();
    binMsg.set(binCode, 0);
    binMsg.set(timestampArray, binCode.byteLength);
    binMsg.set(payload, binCode.byteLength + timestampArrayLength);
    return binMsg;
}
```

## Timestamp Generation

The timestamp is a unix timestamp, a uint32 integer that we expect as the bytes immediately following the 2 code bytes.

The timestamp can be generated using the following function:

```
const timestampArrayLength = 4;
function generateTimestampArray() {
    let timestamp = Math.round(new Date().getTime() / 1000); // get unix timestamp in seconds
    let timestampArray = new Uint8Array(timestampArrayLength);
    for (var index = 0; index < timestampArray.length; index++) {
        var byte = timestamp & 0xff;
        timestampArray[index] = byte;
        timestamp = (timestamp - byte) / 256;
    }
    return timestampArray;
}
```
 

## How to generate a callId

We provide the following function in order to generate an unique ClientCallId, this is to be used if connection comes from a browser.
 
 ```
/**
 * @tag AigentConnector
 * @summary generate unique call identifier.
 * @description generate uuidv4 using xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx schema
 * @param {code} integer. Message type id
 * @param {payload} Uint8Array. Data being sent
 * @response uuid string value
 */


function generateCallId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
```


Otherwise you can use the uuid library instead: https://www.npmjs.com/package/uuid 



## Codes:
```
/**
 *
 * @tag AigentConnector
 * @summary metadata message type
 * @description defines a metadata message type of send method
 */
const codeMetadata = 1;

/**
 * @tag AigentConnector
 * @summary voice message type
 * @description defines a voice message type of send method
 */
const codeVoice = 2;
```


### Code Metadata

The content of the metadata will look like this:

```
  const unique-call-id =  generateCallId(),
  Example of Agent Data:
  {
      voice: {
          'channel': 'agent', // client|agent (mandatory field)
          'clientCallId': 'unique-call-id' // (mandatory field, must be unique per a call) generated uuid
          'codec': 'libopus', // (mandatory field)
          'samplingRate': 48000, // (mandatory field)
          'direction': 'inbound', // inbound|outbound (inbound is default)
      },
      'agentId': '100900', // (mandatory field)
      'category': 'catogory-of-program', // VDN (optional field, this allows the addition of filters to triggers)
      'agentWindowsUsername': 'corp//alex' // the osUsername of the client
      'ani': 'client-phone-number', // (optional field, but some features will not be available)
      'agentAni': 'agent-phone-number', // (optional field)
      'programId': 'program-id', // (optional field)
  }
 ```
 Example of Client Data: 
 ```
 {
      voice: {
          'channel': 'client', // client|agent (mandatory field)
          'clientCallId': unique-call-id, // (mandatory field, must be unique per a call) generated uuid
          'codec': 'libopus', // (mandatory field)
          'samplingRate': 48000, // (mandatory field)
          'direction': 'inbound', // inbound|outbound (inbound is default)
      },
      'agentId': '100900', // (mandatory field)
      'category': 'catogory-of-program', // VDN (optional field, this allows the addition of filters to triggers)
      'agentWindowsUsername': 'corp//alex' // the osUsername of the client
      'ani': 'client-phone-number', // (optional field, but some features will not be available)
      'agentAni': 'agent-phone-number', // (optional field)
      'programId': 'program-id', // (optional field)
  }
 ```





The metadata is encoded with the codeMetadata variable and sent through the websocket

`encode(codeMetadata, metadataObj)`

### Code Audio 

The audio is encoded besides the codeVoice

`encode(codeVoice, audioData)`