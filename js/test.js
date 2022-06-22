import { AigentConnector } from "./AigentConnector.js";
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
        channel: "client", // cleint|agent (mandatory field)
        callId: "generate-call-id", // (mandatory field, must be unique per a call)
        codec: "libopus", // (mandatory field) allows us to convert data to our desired format
        audioContainer: "webm", // (mandatory field), empty if none, this tells us how to extract the audio
        samplingRate: 48000, // (mandatory field)
        direction: "outbound", // inbound|outbound (inbound is default)
    },
    clientId: "clientId", // (mandatory field)
    agentId: "agentId", // (mandatory field)
    category: "revvpro", // (optional field) TODO extract this
    ani: "client-phone-number", // (optional field, but some features might not be available) TODO: extract this
    programId: "clientId", // (optional field)
};

let callId = generateCallId();
const agentMetadata = { ...metadataTemplate };
agentMetadata.voice = { ...metadataTemplate.voice };
agentMetadata.voice.channel = "agent";
agentMetadata.voice.callId = callId;

// let agentStream = new AigentConnector("wss://alex.com/connector", agentMetadata, "", "", true);
let agentStream = new AigentConnector("wss://alpha-aigent-api.aigent.com/connector", agentMetadata, "", "", true);
agentStream.startStream();

// to send data we use
// data is a byte object
agentStream.send(data);

// close ends the connection and the call from the aigent POV
agentStream.close();
