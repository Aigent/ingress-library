// TODO: cache tokens and add a refresh token method
class KeycloakConnector {
    constructor(username, password, token_endpoint) {
        this.token_endpoint = token_endpoint;
        const scope = "openid";
        var details = {
            grant_type: "password",
            scope: scope,
            client_id: "frontend",
            username: username,
            password: password,
        };

        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        this.formBody = formBody.join("&");
    }

    async getToken() {
        const response = await axios.post(this.token_endpoint, this.formBody, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data.access_token;
    }
}
