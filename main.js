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
    setTimeout(() => reject(new Error("Whoops!")), 10000);
  })
};

/////

async function runConcurrentLambda() {
  const concurrencyLimit = 5;
  const depth = 5; // TO DO - Developer - Fix depth in event of infinite recursion

  const argsCopy = ["1", "2"]
  const results = {statuses: {}};
  const promises = new Array(concurrencyLimit).fill(Promise.resolve());

  const params = { TableName: "house" }

  function nextLambda(p) {
    if (argsCopy.length) {
      const arg = argsCopy.shift();
      return p.then(() => {
        try {
          const operationPromise = asyncInvoke("", arg).then(result => { 
            results.body = addResultToResultObject(params.TableName, result.Item, arg, results.body)
            if(result.Item) {
              results["statuses"][params.TableName] = success(result.Item);
              return nextLambda(operationPromise);
            } else {
              results["statuses"][params.TableName] = failure({ status: false, error: "Item not found." });
            }
          }).catch(error => {
            results["statuses"][params.TableName] = failure({ status: false, error: String(error)  })
          });
        } catch(e) {
          results["statuses"][params.TableName] = failure({ status: false, error: String(e) })
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
  if(result) {
    resultObject[name] = result
  } else {
    result = { "id": resultObject[idName] }
  }
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
        house: "hello",
        stevenId: "1"
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

runConcurrentLambda()