router.post('/grant/progress', async (req, res) => {
    const { grantId, status } = req.body;

    try {
      // Find the grant request by ID and update its status to "In Progress"
        const updatedGrant = await GrantScheme.findByIdAndUpdate(
            grantId,
            {
              $set: {
                  'grant_status.status': status, // Set status to "In Progress"
                  'grant_status.decision_date': new Date(), // Set the decision date
              }
            },
            { new: true } // Return the updated document
        );

        if (!updatedGrant) {
            return res.status(404).json({ error: 'Grant request not found' });
        }
        console.log('Progress request called');
        const mailOptions = {
            from: senderemail,
            to: updatedGrant.applicant.contact_details.email,
            subject: 'Regarding Grant Request',
            html: `
            <h1> Congrats your grant request has been taken into consideration and we will update the futher details shortly.</h1>
            `
        };
        // Send the verification email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Mail sent successfully to receiver");
            }
        });

        res.status(200).json({ message: 'Grant request marked as In Progress', updatedGrant });
    } catch (error) {
        console.error('Error marking grant request as In Progress:', error);
        res.status(500).json({ error: 'Failed to mark grant request as In Progress' });
    }
});




/* In frontend /src/components/admin/GrantRequests.jsx file, from there we are getting our front end request. 
In your React code, the request is sent inside the updateGrantStatus function.

The Exact One:  // React (Frontend)
const response = await fetch(apiEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  // THIS IS THE PAYLOAD
  body: JSON.stringify({ grantId: id, status: status }),
});

Breakdown of what happens here:
    1. apiEndpoint: This is the URL (e.g., 'admin/grant/progress').
    2. "fetch": This is a built-in browser function. It acts like a courier service. It takes your data, leaves the browser, travels across the internet, and knocks on your backend's door.
    3. The Configuration Object { ... }:
        => method: 'POST': Tells the backend "I am sending data to change something."
        => headers: Tells the backend "The data inside is JSON format."
        => body: The actual data.

Is it always like this? (General Scenarios) Yes, the concept is always the same, but the syntax might change slightly depending on the tool you use.
    => Native fetch (What you are using): This is built into modern browsers. No installation needed.
    => axios (Very common library): Many developers prefer axios because it is slightly shorter to write.
        Example: "await axios.post(apiEndpoint, { grantId: id, status })"
    => The Flow: In almost all web apps, the flow is:User Action (Click) $\rightarrow$ JavaScript Function $\rightarrow$ HTTP Request (Fetch/Axios) $\rightarrow$ Backend.

The Backend Receipt (req) : 
On your server, Express receives this package.
    => req (Request Object): This is a massive object containing everything about the incoming message (IP address, browser type, URL, cookies, and the data).
    => req.body: Express automatically parses that text string back into a JavaScript Object and puts it into req.body.

So, in your backend code:
*/
// Backend
router.post('/grant/progress', async (req, res) => {
   console.log(req.body); 
   // Output: { grantId: "123", status: "In Progress" }
});






/* Part 2: findByIdAndUpdate (The Database Tool)
1. The Anatomy of the Function
Yes, findByIdAndUpdate generally takes 3 specific arguments in this exact order. */
Model.findByIdAndUpdate( ID, Update_Logic, Options )
/* 
    Argument 1 (The Filter/ID):
        => What it is: The ID of the document you want to change.
        => Your Code: grantId.
        => How it knows: Mongoose assumes the first argument is always the ID (or query filter).
    Argument 2 (The Update Logic):
        => What it is: An object telling MongoDB how to modify the document.
        => Your Code: { $set: { 'grant_status.status': status } }
        => Is it always $set? NO. You can use other commands here:
            -> $set: Updates/Overwrites specific fields (Most common).
                $set: This is a MongoDB operator. It says: "Only update these specific fields. Do not touch the rest of the document."
                    -> Without $set, you risk overwriting the entire document.
            -> $push: Adds an item to an array (e.g., adding a reviewer).
            -> $inc: Increases a number (e.g., views: views + 1).
            -> $unset: Deletes a specific field from the document.
    Argument 3 (The Options):
        => What it is: Settings for how the function behaves.
        => Your Code: { new: true }
        => Is it always new? NO. Common options include:
            -> new: true: Return the modified document (Default is false).
            -> upsert: true: If no document is found, create a new one (Update + Insert).
            -> runValidators: true: Check if the data follows your Schema rules (e.g., email format).
        => The third argument is the Options Object. The specific option { new: true } controls which version of the document the database returns to your variable.
        => Scenario: Imagine a document in the database: { _id: 1, status: "Pending" }. You run an update to change status to "Approved".

        Case A: Without { new: true } (Default) */
        const result = await Model.findByIdAndUpdate(id, { status: "Approved" });
        console.log(result.status); 
        // Output: "Pending" 
/*          -> Why? MongoDB finds the document, updates it in the background, but returns the original copy to you.
            -> Problem: If you send this result back to the frontend, the React screen will still show "Pending" even though the database says "Approved".

        Case B: With { new: true }             */
        const result = await Model.findByIdAndUpdate(id, { status: "Approved" }, { new: true });
        console.log(result.status); 
        // Output: "Approved"
/*          -> Why? MongoDB finds the document, updates it, and then sends the modified copy to you.
            -> Benefit: You can immediately send this updated data to the frontend so the UI updates instantly.




2. Other Common Mongoose Functions

    1) Model.findOne({ ... })
        => Use: Find exactly one document. It stops searching after the first match.
        => Returns: A single Object (if found) or null (if not found).
    Example:   */
// Check if an email is already registered
const user = await User.findOne({ email: "admin@test.com" });
if (user) console.log("User exists!");

/*  2) Model.find({ ... })
        => Use: Find ALL documents that match the criteria.
        => Returns: Always an Array of objects.
            -> If 5 matches: [{...}, {...}, ...]
            -> If 0 matches: [] (Empty array).        
    Example:           */
// Get all approved grants
const approvedGrants = await GrantScheme.find({ "grant_status.status": "Approved" });

/*  3) Model.deleteOne({ ... })
        => Use: Find the first matching document and delete it permanently.
        => Returns: A status object (e.g., { deletedCount: 1 }), not the deleted data.
        => Example:            */
// Delete a draft application
await GrantScheme.deleteOne({ _id: "grant_123" });

/*  4) Model.updateMany({ filter }, { update })
        => Use: Update every document that matches the filter.
        => Returns: A status object showing how many were modified.
            {
                acknowledged: true,
                matchedCount: 5,
                modifiedCount: 5
            }
    Example:           */
// Mark all notifications for a user as "Read"
const result1 = await Notification.updateMany(
  { userId: "123", isRead: false }, // Filter
  { $set: { isRead: true } }        // Update
);
console.log(result1.modifiedCount); // Output: 5



/* nodemailer.createTransport
This is the Setup Phase. It does not send email. It logs into the email service.          */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: '...', pass: '...' }
});
// Function: It creates a "Transporter" object that remembers your credentials. You do this once at the top of your file.

// This block sends an automated notification to the applicant.
const mailOptions = {
    from: senderemail,
    to: updatedGrant.applicant.contact_details.email, // Fetched from the DB result above
    subject: 'Regarding Grant Request',
    html: `<h1> Congrats... </h1>`
};
// Send the verification email
transporter.sendMail(mailOptions, function (error, info) {
    if (error) { console.log(error); }
    else { console.log("Mail sent successfully"); }
});
/* transporter.sendMail
This is the Action Phase. It actually sends the email.
    => Is it(".sendMail") built-in? Yes, it is the main function of the Transporter object. sendMail is used 99% of the time of all the other interactions(or other inbuilt functions) with nodemailer.
    => The Format: It almost always takes two arguments:
        1. The Data (mailOptions): Who is it from? To? Subject? Content?
        2. The Callback (function(error, info)): What to do when finished.                           */
/* Notice: There is no await here!
        => Why? Sending an email can take 1-3 seconds. We don't want the user to wait for that.
        => "Fire and Forget": The code triggers the email and immediately moves to the next line (res.status(200)). The email sends in the background.   */
/* Is the second argument (Callback) optional?
Yes.
    => If you provide it: Nodemailer uses the Callback style (like in your code). It runs the function when finished.
    => If you OMIT it: Nodemailer returns a Promise. This means you can use await.            */
// Modern usage without callback
try {
    await transporter.sendMail(mailOptions);
    console.log("Sent!");
} catch (error) {
    console.log("Failed");
}

/* What is a Callback?
In JavaScript, a callback is a function you pass to another function to be executed later.

In your specific code:          */
transporter.sendMail(mailOptions, function (error, info) { ... });
/*  1. You are saying: "Hey Transporter, take this email (mailOptions)."
    2. The Callback: "I am giving you this function function(error, info). Do not run it now."
    3. Execution: "Only run this function AFTER you have finished talking to the Gmail server."
        => If Gmail says "OK", run my function with error = null.
        => If Gmail says "Login Failed", run my function with error = ErrorObject.                 */

/* 
1. Can we skip await and also callback function and just use transporter.sendMail()?
Yes, you absolutely can.
This is often called "Fire and Forget."
What happens exactly?
    1. Trigger: Node.js tells the email library: "Start sending this email."
    2. Move On: Node.js does not stop. It immediately jumps to the next line (res.status(200)...) and sends the response to the user.
    3. Background: In the background (while the user is already seeing "Success"), the server is still talking to Gmail to send the email.

Pros & Cons of skipping await:
    => ✅ Pro (Speed): The user gets a response instantly (e.g., 0.1 seconds) instead of waiting for the email to send (which might take 2-3 seconds).
    => ❌ Con (Risk): If the email fails (e.g., wrong password, internet down), you will never know. Your code has already finished and told the user "Success." You cannot catch the error.

General Rule:
    => If the email is critical (e.g., "Reset Password"), use await or a Callback so you can confirm it was sent.
    => If the email is optional (e.g., "Welcome Newsletter"), you can skip await to make the app faster.  */

    


/* 2. How do we know if a function returns a Promise?
        1. The "Waiting" Rule (General Logic)
            In modern JavaScript (Node.js), almost any operation that takes time returns a Promise if you don't provide a callback.

            Ask yourself: "Does this task involve leaving my code to talk to something else?
                => "Database: Yes (talks to MongoDB). --> Promise.
                => Network: Yes (talks to API/Email). --> Promise.
                => File System: Yes (talks to Hard Drive). --> Promise (in modern fs.promises).
                => Math: No (Math.max(1, 2)). It's instant. --> Not a Promise.             */




/* "res", "res.status", "res.json"
You asked: What is res alone? Where does it get sent?

res (Response Object): This object represents the open connection between your server and the user's browser. It is strictly a set of tools to reply to the request. You cannot "use" res like a normal variable; you only call its methods to send data back.

The Chain:
    1) res.status(200):
        => This writes a Header on the package. It tells the browser: "Request was Successful (Code 200)."
        => It does not send the response yet. It just labels it.

    2) .json({ message: '...' }):
        This does three things:
            => Converts your JavaScript object into a JSON String.
            => Sets the "Content-Type" header to application/json (so the browser knows how to read it).
            => Ends the connection. It actually pushes the data down the wire to the frontend.

Can we use res alone? No, you must call a method to end the request.
    => res.send('Hello'): Sends text/html.
    => res.json({...}): Sends JSON data.
    => res.end(): Sends nothing, just closes the connection.

Where does it go?
It goes back to the exact line in the React code where fetch was called.
    => Backend:                       */
res.status(200).json({ message: "Updated!", updatedGrant: {...} });
//  => Frontend (React):
const response = await fetch(...);
const data = await response.json();
console.log(data.message); // Output: "Updated!"