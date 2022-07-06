import { AigentConnector } from "./AigentConnector.js";
import fs from "fs";
const AIGENT_API_URL = process.env.AIGENT_API_URL || "wss://ingress.aigent.ai/connector";
const AUDIO_FILE = process.env.AUDIO_FILE || "audio-file/sentences.g729";
const CERT_FILE = process.env.CERT_FILE || "certs/client1.crt";
const CERT_KEY = process.env.CERT_KEY || "certs/client1.key";
function generateCallId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// voice metadata template
const metadataTemplate = {
    voice: {
        channel: "agent", // client|agent (mandatory field)
        clientCallId: "generate-call-id", // (mandatory field, must be unique per a call)
        codec: "g729", // (mandatory field) allows us to convert data to our desired format
        // currently support for g729, pcm mulaw, alaw, libopus (with audioContainer set to webm)
        audioContainer: "", // (mandatory field), empty if none, this tells us how to extract the audio
        samplingRate: 8000, // (mandatory field)
        direction: "outbound", // inbound|outbound (inbound is default)
    },
    agentWindowsUsername: "corp//alex", // (mandatory field)
    clientId: "clientId", // (mandatory field)
    agentId: "agentId", // (mandatory field)
    category: "client-category", // (optional field)
    ani: "client-phone-number", // (optional field, but some features might not be available)
    programId: "programId", // (optional field)
};

let callId = generateCallId();
const agentMetadata = { ...metadataTemplate };
agentMetadata.voice = { ...metadataTemplate.voice };
agentMetadata.voice.channel = "agent";
agentMetadata.voice.clientCallId = callId;

const audio = fs.readFileSync(AUDIO_FILE);

// let agentStream = new AigentConnector("wss://alex.com/connector", agentMetadata, "", "", true);
let agentStream = new AigentConnector(AIGENT_API_URL, agentMetadata, "", "", true);

agentStream.startStream(CERT_FILE, CERT_KEY);

// to send data we use
// data is a byte object
// agentStream.send(data);
for (let position = 0; position < audio.length; position += 80) {
    // 80 bytes offset to create frames
    const audioSlice = audio.slice(position, position + 80);
    agentStream.send(audioSlice);
}

// close ends the connection and the call from the aigent POV
// end the call after 30 seconds to make sure the data is sent through the websocket
setTimeout(function () {
    agentStream.close();
}, 10000);
