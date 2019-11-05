const { buildSchema } = require('graphql');

module.exports = buildSchema(`
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
    `)