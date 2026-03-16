const myMap = new Map<string, object>();

let valueOne = { name: "one" };

myMap.set("one", valueOne);

valueOne.name = "mutated";

console.log(myMap.get("one")); // Output: { name: "mutated" }
