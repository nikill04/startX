/* 1. Startup.find({}) and res.status(200).json(...) */
    // Part A: How Startup.find({}) works exactly         
const Startup = require('../../models/startupmodel');
const startups = await Startup.find({});  

/* 
    1. The require: When you import ../../models/startupmodel, you are importing a Mongoose Model. Think of this as a "Remote Control" that is specifically tuned to talk to the "startups" collection in your MongoDB database. It has buttons (methods) like .find(), .create(), .delete().

    2. The .find({}):
        => This is a command sent to the database.
        => The Filter {}: Inside the parentheses is the query filter. An empty object {} means "match everything." If you wrote { name: "Google" }, it would only match startups named Google.

    3. The Execution:
        => When this line runs, your Node.js server sends a message to the MongoDB database server saying: "Give me all documents in the 'startups' collection."
        => await: The code pauses here. It stops and waits for MongoDB to search its hard drive, gather the data, and send it back.
        => The Result: Once the data comes back, it is stored in the constant startups. This variable now holds an Array of Objects (e.g., [{name: "A"...}, {name: "B"...}]).        */


    // Part B: How res.status(200).json(startups) works
res.status(200).json(startups);
    /* You asked if we are sending the status code along with the data. Yes, exactly.

    A web response is like a package delivery. It has two parts:
        1. The Label (Headers/Status): This is for the browser (or the frontend code) to read first.
            => Status 200: Tells the browser "Everything is OK, open the package."
            => Status 404: Tells the browser "Address not found."
            => Status 500: Tells the browser "The package exploded inside."
        2. The Contents (Body): This is the actual data (the startups array).

    Why do we need the status? The frontend code checks the status before it tries to read the data.
        => If the status is 200, it tries to display the table.
        If the status is 500, it ignores the data and shows a popup: "Server Error, please try again."

    Note: You can write just res.json(startups). If you skip .status(), Express assumes 200 by default. However, writing .status(200) is good practice because it makes your code explicit and clear.     */


// 2. Can we write async (res) instead of async (req, res)?
    /* Short Answer: NO. If you write async (res), your code will break.
    Detailed Explanation: In JavaScript functions, the order of arguments matters, not the names.

    Express always calls your function with three arguments in this exact order:
        => Argument 1: The Request Object (Data coming IN).
        => Argument 2: The Response Object (Tools to send OUT).
        => Argument 3: The Next Function (Used for advanced error handling).
    If you write:                                             */
// WRONG
router.get('/startups', async (res) => {
   // JavaScript puts the FIRST argument (The Request Object) into the variable named 'res'.
   // So now, 'res' actually holds the user's input data!

   res.status(200); // CRASH! The Request object doesn't have a .status() function.
});
    // You must write async (req, res) even if you don't use req. It is a placeholder to ensure res is in the second position, so it receives the correct "Response Tool."


// 3. findById vs find, req.params, and Refactoring .then()
// Part A: Why findById instead of find({ id: id })?
    /* There is a subtle but massive difference between .find() and .findById().

    1. find({ ... }) returns an ARRAY. Even if you look for a unique ID, .find() assumes there might be more than one.
        => Result: [ { name: "Startup A", id: 123 } ] (An array with one item).
        => Frontend headache: The frontend has to write response.data[0].name to get the name.

    2. findById(...) returns a SINGLE OBJECT. It knows you are looking for a unique ID.
        => Result: { name: "Startup A", id: 123 } (Just the object).
        => Frontend joy: The frontend can simply write response.data.name.

    About the _id: In MongoDB, every document has a unique field automatically created called _id (underscore id).
        => Startup.findById(x) is actually a shortcut for Startup.findOne({ _id: x }).
        => If your database uses the default MongoDB IDs, you must use _id. If you created your own custom field called "id", then find({ id: x }) would be the way to go.          */


    // Part B: req.params (The URL Variable)
    /* How it works:
    1. The Route: You define router.get('/eir/:id', ...)
        => The colon : tells Express: "Whatever is written here is a variable, capture it!"
    2. The User's URL: The user visits www.site.com/eir/654abc
    3. The Capture: Express sees the match. It takes 654abc, names it id (because you wrote :id), and puts it in an object: req.params = { id: '654abc' }.

    General Scenario: You are on an e-commerce site. You click a product.
        => The URL changes to /product/99.
        => The backend receives req.params.id = 99.
        => The backend searches the DB for Product #99 and returns it.

    Part C: Refactoring .then() to async/await
    You asked to remove the .then() code and replace it with the modern approach.

    The "Old" Way (currently in your file):                */
    // This uses "Promises". The code inside .then() runs ONLY after the DB replies.
EIR.findById(req.params.id).then((eirRequests) => {
    // Logic inside here
})
/* The "Modern" Way (async/await): This is cleaner because it looks like normal, top-to-bottom code. We use a try/catch block to handle errors (like if the DB crashes).

Here is your replacement code: */
router.get('/eir/:id', async (req, res) => {
  try {
    // 1. Wait for the DB to find the specific document
    const eirRequest = await EIR.findById(req.params.id);

    // 2. Check if it exists. If not, stop and send 404.
    if (!eirRequest) {
      return res.status(404).json({ message: 'EIR request not found' });
    }

    // 3. If found, send it back with status 200
    res.status(200).json(eirRequest);

  } catch (error) {
    // 4. If the DB fails or the ID format is wrong, catch the error here
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
/* Key Differences:
    1. No nesting: You don't have code inside then( ... ). It's flat.
    2. Error Handling: In the old version, if the DB crashed, the app might freeze because there was no .catch(). In the new version, try/catch handles crashes safely.  */