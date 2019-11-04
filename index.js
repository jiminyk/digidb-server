const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');


const app = express();

app.use(bodyParser.json());

app.use('/api', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            digimonList: [String!]!
        }

        type RootMutation {
            createDigimon(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        digimonList: () => {
            return ['Agumon', 'Betamon', 'ShineGreymon']
        },
        createDigimon: (args) => {
            const digimonName = args.name;
            return digimonName;
        }
    },
    graphiql: true
}));

app.listen(3000);