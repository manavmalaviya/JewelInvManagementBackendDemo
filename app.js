const express = require("express");
const cors = require("cors");
const { Attributes, allowedListsMetal, allowedListStone, userCredential, mnfOrder, InvOrder, stoneOrder, stock } = require("./mongo");
const bcrypt = require('bcryptjs');


const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const admin = require('firebase-admin');

const cron = require('node-cron');
const serviceAccount = require('./firebase/jewelrymanufacturing-d92d8-firebase-adminsdk-tk5pv-580cd5d9d1.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://console.firebase.google.com/project/jewelrystockmanagement/firestore/data/~2F',
});

const db = admin.firestore();

cron.schedule('0 0 * * 0', async () => {
    try {
        // Extract data from MongoDB and push to Firebase
        await extractAndPushToFirebase();
        console.log('Data extracted and pushed to Firebase successfully.');
    } catch (error) {
        console.error('Error while extracting data and pushing to Firebase:', error);
    }
});

// async function triggerTransferNow() {
//     try {
//         await extractAndPushToFirebase();
//         console.log('Data extracted and pushed to Firebase successfully (manually triggered).');
//     } catch (error) {
//         console.error('Error while extracting data and pushing to Firebase:', error);
//     }
// }


async function extractAndPushToFirebase() {
    try {
        // Extract data from MongoDB collections
        const attributes = await Attributes.find({}).lean();
        const MnfOrder = await mnfOrder.find({}).lean();
        const AllowedListsMetal = await allowedListsMetal.find({}).lean();
        const AllowedListStone = await allowedListStone.find({}).lean();
        const UserCredential = await userCredential.find({}).lean();
        const invOrder = await InvOrder.find({}).lean();
        const StoneOrders = await stoneOrder.find({}).lean();
        const Stock = await stock.find({}).lean();
        // Add more collections as needed

        // Push data to Firebase collections
        await pushToFirebaseCollection('attributes', attributes);
        await pushToFirebaseCollection('mnfOrder', MnfOrder);
        await pushToFirebaseCollection('stoneOrders', StoneOrders);
        await pushToFirebaseCollection('allowedListsMetal', AllowedListsMetal);
        await pushToFirebaseCollection('allowedListStone', AllowedListStone);
        await pushToFirebaseCollection('userCredential', UserCredential);
        await pushToFirebaseCollection('InvOrder', invOrder);
        await pushToFirebaseCollection('stock', Stock);
        // Add more collections as needed
    } catch (error) {
        throw error;
    }
}

async function pushToFirebaseCollection(collectionName, data) {
    try {
        // Get the Firebase collection reference
        const collectionRef = db.collection(collectionName);

        // Delete all existing documents in the Firebase collection
        const existingDocs = await collectionRef.get();
        existingDocs.forEach(doc => doc.ref.delete());

        // Push the data to the Firebase collection
        for (const item of data) {
            // Remove the "_id" field from the item before pushing it to Firestore
            const cleanedItem = removeMongoDBIds(item);
            await collectionRef.add(cleanedItem);
        }
    } catch (error) {
        throw error;
    }
}

function removeMongoDBIds(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // If the object is an array, recursively clean each element
    if (Array.isArray(obj)) {
        return obj.map(item => removeMongoDBIds(item));
    }

    // Create a new object to store cleaned properties
    const cleanedObj = {};

    for (const [key, value] of Object.entries(obj)) {
        // Skip "_id" fields or any other field starting with "_"
        if (key === '_id' || key.startsWith('_')) {
            continue;
        }

        // If the value is an object, recursively clean it
        if (typeof value === 'object') {
            cleanedObj[key] = removeMongoDBIds(value);
        } else {
            // Otherwise, add the property as is
            cleanedObj[key] = value;
        }
    }

    return cleanedObj;
}


app.get("/", async (req, res) => {

    try {
        if (req.query.type === "attr") {
            const attrResponse = await Attributes.find({});
            res.json(attrResponse);
        }
        if (req.query.type === "mnfOrder") {

            const orderListResponse = await mnfOrder.find({});
            res.json(orderListResponse);
        }
        if (req.query.type === "stoneOrder") {

            const orderListResponse = await stoneOrder.find({});
            res.json(orderListResponse);
        }
        if (req.query.type === "invOrder") {

            const orderListResponse = await InvOrder.find({});
            res.json(orderListResponse);
        }
        if (req.query.type === "stock") {

            const orderListResponse = await stock.find({});
            res.json(orderListResponse);
        }
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});


app.get("/manufacturing", async (req, res) => {

    try {
        if (req.query.type === "Metal") {

            const attrResponse = await allowedListsMetal.find({});
            res.json(attrResponse);
        }
        if (req.query.type === "Stone") {

            const attrResponse = await allowedListStone.find({});
            res.json(attrResponse);
        }


    } catch (e) {
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});



app.patch("/", async (req, res) => {

    try {

        await stock.updateOne({ _id: req.body._id }, { $set: req.body });

        res.json(req.body)

    }
    catch (e) {
        res.json("fail")
    }

})






app.post("/attrlist/add", async (req, res) => {
    try {

        if (req.body.Type === "Metal") {
            const check = await Attributes.findOne({
                "Metal.metalType": req.body.Metal.metalType,
                "Metal.metalColor": req.body.Metal.metalColor,
                "Metal.metalPurity": req.body.Metal.metalPurity,
            })
            // console.log(check)
            if (!(check)) {
                await Attributes.insertMany(req.body);

                res.json(req.body)
            }
            else {
                res.json(false)
            }
        }
        else {
            // const check = await Attributes.findOne({Stone: { stoneType: req.body.Stone.stoneType, stoneShape: req.body.Stone.stoneShape, stoneColor: req.body.Stone.stoneColor }})

            const check = await Attributes.findOne({
                "Stone.stoneType": req.body.Stone.stoneType,
                "Stone.stoneShape": req.body.Stone.stoneShape,
                "Stone.stoneColor": req.body.Stone.stoneColor
            });

            // console.log(check)
            if (!(check)) {
                await Attributes.insertMany(req.body);

                res.json(req.body)
            }
            else {
                res.json(false)
            }

        }
    } catch (e) {
        console.log(e);
    }
})


app.post("/manufacturing", async (req, res) => {

    try {
        if (req.query.type === "Metal") {

            const response = await allowedListsMetal.insertMany(req.body)
            res.json(response)
        }
        if (req.query.type === "Stone") {

            const attrResponse = await allowedListStone.insertMany(req.body);
            res.json(attrResponse);
        }

    } catch (e) {

    }
})


app.post("/manufacturing/add", async (req, res) => {


    try {

        if (req.query.type === "Metal") {
            const check = await mnfOrder.findOne({ id: req.body.id })
            if (check) {
                const response = await mnfOrder.replaceOne({ _id: req.body._id }, req.body)
                res.json(response)
            }
            else {
                const response = await mnfOrder.insertMany(req.body)
                res.json(response)
            }
        }
        if (req.query.type === "Stone") {
            const check = await stoneOrder.findOne({ id: req.body.id })
            if (check) {
                const response = await stoneOrder.replaceOne({ id: req.body.id }, req.body)
                res.json(response)
            }
            else {
                const response = await stoneOrder.insertMany(req.body)
                res.json(response)
            }
        }
    } catch (e) {
        console.log(e)
    }
})


app.post("/", async (req, res) => {

    try {

        if (req.query.type === "Metal") {
            const checklist = []
            for (const label of req.body) {

                for (const singleOrder of label.orderDetails) {

                    const check = await mnfOrder.findOne({
                        givenDate: label.givenDate,
                        receivedDate: label.receivedDate,
                        "Metal.metalColor": label.Metal.metalColor,
                        "Metal.metalPurity": label.Metal.metalPurity,
                        "Metal.metalWeight": label.Metal.metalWeight,
                        "Metal.metalType": label.Metal.metalType,
                        "Metal.Alloy.alloyWeight": label.Metal.Alloy.alloyWeight,
                        "Metal.Alloy.alloyColor": label.Metal.Alloy.alloyColor,
                        "Runner.runnerColor": label.Runner.runnerColor,
                        "Runner.runnerPurity": label.Runner.runnerPurity,
                        "Runner.runnerWeight": label.Runner.runnerWeight,
                        totalMetalGiven: label.totalMetalGiven,
                        totalMetalReceived: label.totalMetalReceived,
                        totalRunnerReceived: label.totalRunnerReceived,
                        castingLoss: label.castingLoss,
                        usedInOrder: label.usedInOrder,
                        netLoss: label.netLoss,
                        "orderDetails.orderId": singleOrder.orderId,
                        "orderDetails.orderWeight": singleOrder.orderWeight
                    }, { _id: 0 });
                    checklist.push(check)
                    // console.log(check)

                    if (check === null) {
                        await mnfOrder.insertMany(label)
                    }
                }




            }

            res.json(checklist)
        }
        if (req.query.type === "Stone") {
            const checklist = []
            for (const order of req.body) {
                for (const stone of order.stoneOrder) {
                    const check = await stoneOrder.findOne({
                        givenDate: order.givenDate,
                        'stoneOrder.stoneType': stone.stoneType,
                        'stoneOrder.stoneShape': stone.stoneShape,
                        'stoneOrder.stoneColor': stone.stoneColor,
                        'stoneOrder.stoneSize': stone.stoneSize,
                        'stoneOrder.stoneQty': stone.stoneQty,
                        'stoneOrder.brokenQty': stone.brokenQty,
                        'stoneOrder.orderId': stone.orderId,
                    })
                    checklist.push(check);

                    if (check === null) {
                        await stoneOrder.insertMany(order)
                    }
                }
            }
            res.json(checklist)
        }
        if (req.query.type === 'Stock') {
            const response = await stock.insertMany(req.body)
            res.json(response)
        }

    } catch (e) {

        console.log(e)
    }
})


app.post("/inventory/add", async (req, res) => {
    try {

        const response = await InvOrder.insertMany(req.body)
        res.json(response)

    } catch (e) {
        console.log(e)
    }
})

app.post('/signup', async (req, res) => {
    // console.log(req.body.params)
    username = req.body.params.userName
    password = req.body.params.password
    const response = await userCredential.findOne({ userName: username })
    const isAdmin = await userCredential.findOne({ isAdmin: true })


    if (response) {
        res.json(false)
    }
    else {
        if (isAdmin) {
            const updatedAdmin = await {
                ...req.body.params,
                isAdmin: false
            };
            await userCredential.insertMany(updatedAdmin);
            res.json(true);
        } else {
            const updatedUser = await {
                ...req.body.params,
                isAdmin: true
            };
            await userCredential.insertMany(updatedUser);
            res.json(true);
        }
    }
})

app.get('/login', async (req, res) => {
    try {

        const doc = await userCredential.findOne({})

        if (doc) {
            res.json(false)
        } else {
            res.json(true)
        }
    } catch (e) {
        console.error('Error checking for user document:');
        res.status(500).json({ error: 'Internal Server Error' });
    }


})

app.post('/login', async (req, res) => {
    const { userName, password } = req.body.params
    console.log(userName, password)
    const response = await userCredential.findOne({ userName: userName })

    if (response !== null) {

        const passwordMatch = await bcrypt.compare(password, response.password)
        if (passwordMatch) {

            res.json({ foundUser: true, isAdmin: response.isAdmin })
        }
        else {
            res.json(false)
        }
    }
    else {
        res.json('userNotFound')
    }
})

app.delete("/", async (req, res) => {
    try {
        const id = req.query.props


        if (req.query.propName === "attr") {
            res.json(await Attributes.deleteOne({ _id: id }))
        }
        if (req.query.propName === "mnfOrder") {
            res.json(await mnfOrder.deleteOne({ _id: id }))
        }
        if (req.query.propName === "stoneOrder") {
            res.json(await stoneOrder.deleteOne({ _id: id }))
        }
    } catch (e) {

        res.json(e)
    }
})


app.delete("/invoice", async (req, res) => {
    try {
        const id = req.query.type;
        res.json(await InvOrder.deleteOne({ _id: id }))
    } catch (e) {

    }
})

// app.listen(4000, "192.168.121.41", () => {
//     console.log("port connected");
// })

module.exports = app
