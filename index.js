const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Digimon = require('./models/digimon');

const app = express();

app.use(bodyParser.json());

app.use('/api', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            allDigimon: [Digimon!]!
        }

        type RootMutation {
            createDigimon(digimonInput: DigimonInput): Digimon
        }

        type Digimon {
            _id: ID!
            name: String!
            description: String
            personality: String
            stage: String
            attribute: String
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
                    return { ...digimon._doc };
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
            });
            return digimon
            .save()
            .then(result => {
                return {...result._doc};
            })
            .catch(err => {
                console.log(err);
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