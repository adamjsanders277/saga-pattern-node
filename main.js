var co = require('co');
const Promise = require('bluebird')

// Test code ///
let counter = 0;
let interval;
const numberOfOperations = 2;
const listOfArguments = [];
const listOfDelays = [];

for (let i = 0; i < numberOfOperations; i++) {
  listOfArguments.push(i);
}

const asyncInvoke = (name, testId) => {
  return new Promise((resolve, reject) => {
    //const result = await dynamoDbLib.call("get", params);
    resolve(testCall(name, testId));
    setTimeout(() => reject(new Error("Call reached timeout")), 6000);
  })
};

/////

async function runConcurrentLambda(params) {
  const concurrencyLimit = 5;
  const depth = 5; // TO DO - Developer - Fix depth in event of infinite recursion

  const paramsCopy = [ {id: "1", TableName: "house"}, {id: "2", TableName: "house2" } ]
  const results = {statuses: {}};
  const promises = new Array(concurrencyLimit).fill(Promise.resolve());
  const currentDepth = 0

  function nextLambda(p) {
    if (paramsCopy.length) {
      const params = paramsCopy.shift();
      return p.then(() => {
        try {
          const operationPromise = asyncInvoke("", params.id).then(result => { 
            results.body = addResultToResultObject(params.TableName, result.Item, params.id, results.body)
            if(result.Item) {
              results["statuses"][params.TableName] = success(result.Item);
              /*
              if(currentDepth >= depth) {
                results["statuses"]["other"] = failure({ status: false, error: "Max depth exceeded, increase depth size at own caution" });
                return results;
              }
              currentDepth++;
              */
              return nextLambda(operationPromise);
            } else {
              results["statuses"][params.TableName] = failure({ status: false, error: "Item not found." });
            }
          }).catch(error => {
            results["statuses"][params.TableName] = failure({ status: false, error: String(error)  })
          });
        } catch(error) {
          results["statuses"][params.TableName] = failure({ status: false, error: String(error) })
        }
      });
    }
  }

  await Promise.all(promises.map(nextLambda));
  console.log(results)
  return results;
}

function addResultToResultObject(name, result, idName, resultObject) {
  if(!resultObject) {
    return result
  }
  if(!result) {
    result = { "id": resultObject[idName] }
  }
  resultObject[name] = result
  delete resultObject[idName]
  return resultObject
}

function testCall(type, params) {
  if(params == "1") {
    return ({
      Item : {
        house: "hello",
        stevenId: "1"
      }
    })
  }
  else if(params == "2") {
    return ({
      Item : {
        house2: "hello2",
        stevenId2: "2"
      }
    })
  }
}

function success(body) {
  return buildResponse(200, body);
}

function failure(body) {
  return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*"
      ,
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}

runConcurrentLambda(["1", "2"])