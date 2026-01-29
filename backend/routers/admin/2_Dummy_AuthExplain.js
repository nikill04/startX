router.post('/eir/selectreviewer/:requestId', async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const selectedReviewerIds = req.body; // Array of currently selected reviewer IDs

    const eirDocument = await EIR.findById(requestId);
    if (!eirDocument) {
      return res.status(404).json({ message: 'EIR document not found' });
    }

    // Current reviewers in EIR document
    const currentReviewerIds = eirDocument.reviews.map(review => review.reviewer_id.toString());

    // Determine reviewers to add and remove
    const reviewersToAdd = selectedReviewerIds.filter(id => !currentReviewerIds.includes(id));
    const reviewersToRemove = currentReviewerIds.filter(id => !selectedReviewerIds.includes(id));

    // Add new reviewers
      await Promise.all(reviewersToAdd.map(async reviewerId => {
          const reviewer = await Reviewer.findById(reviewerId);
          if (!reviewer) {
              return res.status(404).json({ message: `Reviewer with ID ${reviewerId} not found` });
          }

          // Add request ID to the reviewer's review list if not already present
          if (!reviewer.reviews.some(review => review.id === requestId)) {  // Here, in reviewers collection in on review field of any reviewer, id(review.id) is the id of the eir document
              reviewer.reviews.push({ id: requestId });
              await reviewer.save();

              // Add reviewer details to the EIR document
              eirDocument.reviews.push({
                  reviewer_id: reviewer._id,
                  reviewer_name: reviewer.name,
                  status:"pending",
                  rating:0,
                  reviewer_email: reviewer.email,
                  reviewer_organization: reviewer.organization
            });
          }
      }));

      // Remove unselected reviewers
      await Promise.all(reviewersToRemove.map(async reviewerId => {
          const reviewer = await Reviewer.findById(reviewerId);
          if (!reviewer) {
              return res.status(404).json({ message: `Reviewer with ID ${reviewerId} not found` });
          }

          // Remove the request ID from the reviewer's reviews
          reviewer.reviews = reviewer.reviews.filter(review => review.id !== requestId);
          await reviewer.save();

          // Remove from EIR document reviews as well
          eirDocument.reviews = eirDocument.reviews.filter(review => review.reviewer_id.toString() !== reviewerId);
      }));


      eirDocument.status.status = "Under Review"
      // Save the updated EIR document
      await eirDocument.save();

      res.status(200).json({ message: "Reviewers updated successfully", eir: eirDocument });
  } 
  catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while updating reviewers", error: error.message });
  }
});









/*The short answer is: NO. You cannot simply write "await" "reviewersToAdd.map(...)". It will fail to wait. The code will rush forward before your database updates are finished.

Here is the exact mechanical reason why, step-by-step.
1. The Limitation of "await"
    => The await keyword is very specific. It waits for ONE single Promise.
    => If you give "await" something that is not a Promise (like a number, a string, or an Array), it ignores the "await" completely and moves to the next line instantly.

2. What .map() Returns
The .map() function creates a new Array. If the function inside .map() is async, every item in that new Array is a Promise.  */
const myArray = [1, 2, 3];
const result = myArray.map(async (num) => {
   return await Database.save(num);
});
// 'result' is NOW an Array of Promises:
// [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]

/* 3. Why Your Suggested Code Fails
Let's trace what happens if you write exactly what you asked:       */
// THE WRONG WAY (Your suggestion)
await reviewersToAdd.map(async (reviewerId) => {
   await Reviewer.findById(reviewerId);
   await reviewer.save();
});

res.status(200).json({ message: "Done" });
/* The Execution Flow:
    1) Line 1 (.map) runs: It starts the DB operations for all reviewers. It immediately returns an Array of pending promises: [ P1, P2, P3 ].

    2) The await kicks in: The code effectively looks like this: await [ P1, P2, P3 ].

    3) The Fatal Flaw: The await keyword looks at [ P1, P2, P3 ] and says: "Is this specific object a Promise? No, it is an Array."

    4) The Result: Because it is an Array, await thinks there is nothing to wait for. It immediately moves to the next line.

    5) Line 5 (res.status(200)) runs: The server sends "Success" to the user.

    6) The Bug: The database operations (P1, P2, P3) are still running in the background.
        => If one of them fails 100ms later, the user has already received a "Success" message. You cannot catch the error anymore.
        => The user might see "Success," refresh the page, and see the old data because the save hasn't finished yet.   */

/* 4. The Solution: Promise.all
We need a tool that converts an Array of Promises into a Single Promise that await can understand. That tool is Promise.all.

How it works:
    1. Input: You give it [ P1, P2, P3 ].
    2. Process: It creates a new "Super Promise."
    3. Condition: This Super Promise says: "I will only resolve when P1 AND P2 AND P3 are all finished."
    4. The Fix: Now you can write await SuperPromise.             */
// THE CORRECT WAY
const arrayOfPromises = reviewersToAdd.map(async (reviewerId) => { ... });
// arrayOfPromises is [ P1, P2, P3 ]

const superPromise = Promise.all(arrayOfPromises);
// superPromise is ONE Promise Object

await superPromise;
// Now 'await' sees a real Promise. It pauses until everything is done.




/* The map function does not modify the original array reviewersToAdd. Instead, map returns a new array.
    => Since the function inside is async, map returns an Array of Promises.
    => It looks like this: [ Promise(Update ID_A), Promise(Update ID_B) ].
    => This array is exactly what Promise.all(...) needs as input. */





/* 1. Can we use .find() instead of .some()?
Short Answer: Yes, you absolutely can. The code will work perfectly.
The Explanation: In JavaScript, if statements check if a value is "Truthy" or "Falsy".

Using .find():
    => If a match exists: .find() returns the Object (e.g., { id: 123 }). JavaScript treats Objects as True.
    => If no match exists: .find() returns undefined. JavaScript treats undefined as False.
So, if (!reviewer.reviews.find(...)) works because !undefined becomes true (meaning "It was not found, so go ahead and add it").

Why did the developer use .some()? It is a matter of coding style and intention.
    => .some() returns true or false. It asks a Yes/No question: "Does this exist?"
    => .find() returns Data or Undefined. It asks: "Give me the data."

When other developers read .some(), they immediately know: "Ah, we are just checking for existence, we don't need to use the data itself." When they read .find(), they might look to see if you are using that found variable later. Since you are just checking specifically for uniqueness, .some() is slightly cleaner          */

/* 
.push(...)
This adds an item to the end of an array.
    => In Memory: When you do reviewer.reviews.push(...), you are only updating the data inside the computer's temporary memory (RAM). You have not changed the database yet.

.save()
This is the command that writes changes to the hard drive (Database).
    => Sequence:
        1. "findById" (Bring data from DB to Memory).
        2. ".push" (Modify data in Memory).
        3. "await .save()" (Send modified data back to DB).

    => If you forget .save(), the .push() will happen, but as soon as the request ends, the data disappears because it was never written to MongoDB.     */