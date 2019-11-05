const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Digimon = require('./models/digimon');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

const user = userId => {
    return User
    .findById(userId)
    .then(user => {
        return { 
            ...user._doc, 
            createdDigimon: allDigimon.bind(this, user._doc.createdDigimon) 
        };
    })
    .catch(err => { throw err;})
}

const allDigimon = digimonIds => {
    return Digimon.find({_id: {$in: digimonIds } })
    .then(allDigimon => {
        return allDigimon.map(digimon => {
            return { 
                ...digimon._doc, 
                createdBy: user.bind(this, digimon.createdBy)
            };
        });
    })
    .catch(err => {
        throw err;
    });
};

app.use('/api', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            allDigimon: [Digimon!]!
        }

        type RootMutation {
            createDigimon(digimonInput: DigimonInput): Digimon
            createUser(userInput: UserInput): User
        }

        type Digimon {
            _id: ID!
            name: String!
            description: String
            personality: String
            stage: String
            attribute: String
            createdBy: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdDigimon: [Digimon!]
        }

        input UserInput {
            email: String!
            password: String
        }

        input DigimonInput {
            name: String!
            description: String
            personality: String
            stage: String
            attribute: String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        allDigimon: () => {
            return Digimon
            .find()
            .then(allDigimon => {
                return allDigimon.map(digimon => {
                    return { 
                        ...digimon._doc, 
                        createdBy: user.bind(this, digimon._doc.createdBy) 
                    };
                });
            })
            .catch(err => {
                throw err;
            });
        },
        createDigimon: (args) => {
            const digimon = new Digimon({
                name: args.digimonInput.name,
                description: args.digimonInput.description,
                personality: args.digimonInput.personality,
                stage: args.digimonInput.stage,
                attribute: args.digimonInput.attribute,
                createdBy: '5dc1b3ecb2f39a7f621456b8'
            });
            let createdDigimon;
            return digimon
            .save()
            .then(result => {
                createdDigimon = { 
                    ...result._doc, 
                    createdBy: user.bind(this, result._doc.createdBy)
                };
                return User.findById('5dc1b3ecb2f39a7f621456b8');
            })
            .then(user => {
                if (!user) {
                    throw new Error('User not found.')
                }
                user.createdDigimon.push(digimon);
                return user.save();
            })
            .then(result => {
                return createdDigimon;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
        },
        createUser: (args) => {
            return User.findOne({email: args.userInput.email}).then(user => {
                if (user) {
                    throw new Error('User exists already.')
                }
                return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then(result => {
                return{...result._doc, password: null}
            })
            .catch(err => {
                throw err;
            });
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@digidb-rbpnb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
    app.listen(3000);
}).catch(err => {
    console.log(err);
});