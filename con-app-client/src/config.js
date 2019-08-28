export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    REGION: "us-west-1",
    BUCKET: "convention-maker"
  },
  apiGateway: {
    REGION: "us-west-1",
    URL: "https://kvbj8eu2dj.execute-api.us-west-1.amazonaws.com/prod"
  },
  apiGateway2: {
    REGION: "us-west-1",
    URL: "https://kvbj8eu2dj.execute-api.us-west-1.amazonaws.com/prod/public-conventions"
  },
  cognito: {
    REGION: "us-west-2",
    USER_POOL_ID: "us-west-2_3MIb6Kzye",
    APP_CLIENT_ID: "5oskc33f5je233de51saag3aik",
    IDENTITY_POOL_ID: "us-west-2:c0413a8b-2d3e-48ab-b694-377cf6fc26ad"
  }
};