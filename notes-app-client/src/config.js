export default {
    MAX_ATTACHMENT_SIZE: 5000000,
    s3: {
      REGION: "us-west-1",
      BUCKET: "note-app-weboshi"
    },
    apiGateway: {
      REGION: "us-west-1",
      URL: "https://qr61u0ebi3.execute-api.us-west-1.amazonaws.com/prod"
    },
    cognito: {
      REGION: "us-west-2",
      USER_POOL_ID: "us-west-2_hpoVFu0aC",
      APP_CLIENT_ID: "35tp1blv7j6tguqr9fmddb0bod",
      IDENTITY_POOL_ID: "us-west-2:1b7269fd-1cea-42e4-86db-d4ad3f6d467e"
    }
  };