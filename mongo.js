require('dotenv').config()
const mongoose = require("mongoose")
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        contacts = false
        console.log('failed');
    })

const newSchemaAttr = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    Metal: {
        metalType: {
            type: String
        },
        metalColor: {
            type: String

        },
        metalPurity: {
            type: String,

        },
        includesAlloy: {
            type: String,

        },
        Alloy: {
            alloyColor: {
                type: String,

            }
        }
    },
    Stone: {
        stoneType: {
            type: String,

        },
        stoneShape: {
            type: String,

        },
        stoneColor: {
            type: String,

        },
        stoneSize: [
        ]
    },
})


const newSchemamnfOrder = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    givenDate: {
        type: String,
        required: true
    },

    receivedDate: {
        type: String,
        required: false
    },
    Metal: {
        metalWeight: {
            type: Number,
            required: true
        },
        metalType: {
            type: String,
            required: true
        },
        metalColor: {
            type: String,
            required: true
        },
        metalPurity: {
            type: String,
            required: true
        },
        Alloy: {
            alloyWeight: {
                type: Number,
                required: false
            },
            alloyColor: {
                type: String,
                required: false
            }
        }
    },
    Runner: {
        runnerWeight: {
            type: Number,
            required: true
        },
        runnerColor: {
            type: String,
            required: true
        },
        runnerPurity: {
            type: String,
            required: true

        }
    },
    totalMetalGiven: {
        type: Number,
        required: true
    },
    totalMetalReceived: {
        type: Number,
        required: true
    },
    totalRunnerReceived: {
        type: Number,
        required: true
    },
    castingLoss: {
        type: Number,
        required: true
    },
    usedInOrder: {
        type: Number,
        required: true
    },
    netLoss: {
        type: Number,
        required: true
    },

    orderDetails: [{
        orderId: {
            type: String,
            required: false
        },
        orderWeight: {
            type: Number,
            required: false
        }

    }],

})

const newschemaStoneOrder = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    givenDate: {
        type: String,
        required: true
    },
    stoneOrder: [
        {
            stoneType: {
                type: String,
                required: false
            },
            stoneShape: {
                type: String,
                required: false
            },
            stoneColor: {
                type: String,
                required: false
            },
            stoneSize: {
                type: String,
                required: false
            },
            stoneQty: {
                type: Number,
                required: false
            },
            brokenQty: {
                type: String,
                required: false
            },
            orderId: {
                type: String,
                required: false
            },
        }
    ]
})

const newSchemaInvOrder = new mongoose.Schema({

    purchaseDate: { type: String },
    purchaseType: { type: String },
    purchaseOf: { type: String },
    PurchaseItem: {
        Metal: {
            metalType: { type: String },
            metalWeight: { type: Number },
        },
        Stone: {
            stoneType: { type: String },
            stoneShape: { type: String },
            stoneSize: { type: String },
            stoneColor: { type: String },
            stoneQty: { type: Number },
        },
        Runner: {
            runnerColor: { type: String },
            runnerPurity: { type: String },
            runnerWeight: { type: Number },
        },
        Alloy: {
            alloyType: { type: String },
            alloyWeight: { type: Number },
        }
    },
    purchaseFrom: { type: String },
    Reuse: {
        isReuse: { type: Boolean },
        reuseList: [{
            runnerColor: { type: String },
            runnerPurity: { type: String },
            runnerWeight: { type: Number },
            expGoldWeight: { type: Number },
        }],
        netRunnerMelted: { type: Number },
        netExpectedGold: { type: Number },
        netGoldReceived: { type: Number },
        netLoss: { type: Number },
    }
})
const newSchemaStock = new mongoose.Schema({
    items: {

    },
    qty: {
        type: "Number",
        required: true
    }
});


const newSchemaAllowedList = new mongoose.Schema({

    label: { type: String },
    key: { type: String },
})
// const newSchemaAllowedListStone = new mongoose.Schema({
//     label: { type: String },
//     key: { type: String },
// })
const newSchemaUserCredentials = new mongoose.Schema({
    isAdmin:{
        type:Boolean,
        reduired:true
    },
    userName: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    }
})


const mnfOrder = mongoose.model("mnfOrder", newSchemamnfOrder)
const Attributes = mongoose.model("Attributes", newSchemaAttr)
const InvOrder = mongoose.model("InvOrder", newSchemaInvOrder)
const allowedListsMetal = mongoose.model("allowedListsMetal", newSchemaAllowedList)
const allowedListStone = mongoose.model("allowedListStone", newSchemaAllowedList)
const userCredential = mongoose.model('userCredential', newSchemaUserCredentials)

const stoneOrder = mongoose.model("stoneOrder", newschemaStoneOrder)
const stock = mongoose.model("stock", newSchemaStock)
module.exports = { Attributes, mnfOrder, allowedListsMetal, userCredential, allowedListStone, InvOrder, stoneOrder, stock };