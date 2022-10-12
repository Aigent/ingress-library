addEventListener("DOMContentLoaded", event => {
    // const AIGENT_API_URL = "wss://ingress.aigent.ai/connector";
    const AIGENT_API_URL = "ws://localhost:10000/connector";

    const AUDIO_FILE = "audio-file/sentences.g729";

    function generateCallId() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    var username = "username";
    var password = "password";
    var keycloak_token_endpoint = "https://auth.aigent.ai/auth/realms/dashboard/protocol/openid-connect/token";
    const keycloak = new KeycloakConnector(username, password, keycloak_token_endpoint);
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

    const clientMetadata = { ...metadataTemplate };
    clientMetadata.voice = { ...metadataTemplate.voice };
    clientMetadata.voice.channel = "client";
    clientMetadata.voice.clientCallId = callId;

    let agentStream = new AigentConnector(AIGENT_API_URL, agentMetadata, "", "", true);
    let clientStream = new AigentConnector(AIGENT_API_URL, clientMetadata, "", "", true);

    // Tokens expire so make sure to get a new one before starting the stream
    keycloak
        .getToken()
        .then(async token => {
            agentStream.startStream(token);
            clientStream.startStream(token);
            var reader;
            async function processData({ done, value }) {
                if (done) {
                    console.log("Done reading");
                    setTimeout(function () {
                        agentStream.close();
                        clientStream.close();
                    }, 10000);
                    return;
                }
                let audio = value;
                console.log("got some data", audio);
                for (let position = 0; position < audio.length; position += 10) {
                    // 10 bytes offset to create g729 10 milliseconds frames, this is to emulate a real call,
                    // not required in a production settings. Data should be send as fast as possible
                    const audioSlice = audio.slice(position, position + 10);
                    // console.log(audioSlice);
                    agentStream.send(audioSlice);
                    clientStream.send(audioSlice);
                    await pause10Ms();
                }
                setTimeout(reader.read().then(processData), 10);
            }
            var response = await fetch("/audio-file/sentences.g729");
            reader = response.body.getReader();
            reader.read().then(processData).catch(err, console.log("error while reading", err));
        })
        .catch(err => {
            console.log("error while getting keycloak token", err);
        });
});

// return promise after 10 ms
function pause10Ms() {
    return new Promise(resolve => {
        setTimeout(resolve, 10);
    });
}
