const AWS = require('aws-sdk');
const jwtDecode = require('jwt-decode');
const util = require('./util');
const _ = require('underscore');

AWS.config.update({
    region: 'us-east-2'
});

const cognitoIdentity = new AWS.CognitoIdentity();
const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;

exports.handler = async (event) => {
    try {
        let id_token = util.getIdToken(event.headers);
        let params = {
            IdentityPoolId: identityPoolId,
            Logins:{
                'accounts.google.com': id_token
            }
        }
        let data = await cognitoIdentity.getId(params).promise();
        params.IdentityId = data.IdentityId;
        data = await cognitoIdentity.getCredentialsForIdentity(params).promise();
        let decoded = jwtDecode(id_token);
        data.user_name = decoded.name;

        return {
            statusCode :200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data)
        }

    } catch (err){
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}