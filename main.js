var co = require('co');
const Promise = require('bluebird')

// Test code ///
let counter = 0;
let interval;
const numberOfOperations = 25;
const listOfArguments = [];
const listOfDelays = [];

for (let i = 0; i < numberOfOperations; i++) {
  listOfArguments.push(i);
  listOfDelays.push(Math.ceil(Math.random() * 9) * 1000);
}

const asyncOperation = index => {
  counter++;
  return new Promise(resolve =>
    setTimeout(() => {
      console.log('Operation performed:', index);
      counter--;
      resolve(index);
    }, listOfDelays[index]))
};

/////

async function runConcurrentLambda() {
  const concurrencyLimit = 5;
  const depth = 5; // TO DO - Developer - Fix depth in event of infinite recursion

  const argsCopy = [].concat(listOfArguments.map((val, ind) => ({ val, ind })));
  const results = {};
  const promises = new Array(concurrencyLimit).fill(Promise.resolve());

  function nextLambda(p) {
    if (argsCopy.length) {
      const arg = argsCopy.shift();
      return p.then(() => {
        try {
          const operationPromise = asyncOperation(arg.val).then(r => { 

            const result = await dynamoDbLib.call("get", params);
            results.body = addResultToResultObject(result.Item, results.body)
            if(result.Item) {
              results["statuses"][params.TableName] = success(result.Item);

              add result to full json

              // example 
              // results.body = { servingLocationUUID : 1 }
              // if success get back result.Item = { id : 1, name: "hello" }
                  // return results.body = { servingLocation: { id: 1, name: "hello"}}
              // else return results.body

              results["body"] = 
              return nextLambda(operationPromise);
            } else {
              result["statuses"][params.TableName] = failure({ status: false, error: "Item not found." });
            }
          
          });
        } catch(e) {
          result["statuses"][params.TableName] = failure({ status: false, error: str(e)  })
        }
      });
    }
    return p;
  }

  await Promise.all(promises.map(chainNext));
  console.log(result)
  return result;
}

function addResultToResultObject(result, resultObject) {
  // example 
              // results.body = { servingLocationUUID : 1 }
              // if success get back result.Item = { id : 1, name: "hello" }
                  // return results.body = { servingLocation: { id: 1, name: "hello"}}
              // else return results.body
  if()
  
}