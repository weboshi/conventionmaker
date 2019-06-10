
import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "conventions",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      conId: uuid.v1(),
      createdAt: Date.now(),
      title: data.title,
      headline: data.headline,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}

//AWS.config.update({ region: "us-west-1" });
