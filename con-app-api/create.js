
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
      eventLocation: data.eventLocation,
      startDate: data.startDate,
      endDate: data.endDate,
      faq: null,
      events: null,
      header: null,
      blurb: null,
      banner: null,
      schedule: null,
      published: 0,
      conventionTags: data.conventionTags,
      conventionId: null,
      conventionCategory: data.conventionCategory
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}


export async function addPublic(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "public-conventions",
    Item: {
      conventionId: data.conventionId,
      conventionCategory: data.conventionCategory,
      userId: event.requestContext.identity.cognitoIdentityId,
      conId: uuid.v1(),
      createdAt: Date.now(),
      title: data.title,
      headline: data.headline,
      description: data.description,
      eventLocation: data.eventLocation,
      startDate: data.startDate,
      endDate: data.endDate,
      faq: data.faq,
      events: data.events,
      header: data.header,
      blurb: data.blurb,
      banner: data.banner,
      schedule: data.schedule,
      conventionTags: data.tags
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}