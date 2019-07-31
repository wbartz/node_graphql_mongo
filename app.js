const express = require("express");
const expressGraphQL = require("express-graphql");
const statusMonitor = require("express-status-monitor");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema
} = require("graphql");

const app = express();

app.use(statusMonitor());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect();

const UserModel = mongoose.model("usuarios", {
  name: String,
  email: String,
  login: String
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    login: { type: GraphQLString }
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      people: {
        type: GraphQLList(UserType),
        resolve: (root, args, context, info) => {
          return UserModel.find().exec();
        }
      },
      person: {
        type: UserType,
        args: {
          id: { type: GraphQLNonNull(GraphQLID) }
        },
        resolve: (root, args, context, info) => {
          return UserModel.findById(args.id).exec();
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      person: {
        type: UserType,
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          email: { type: GraphQLNonNull(GraphQLString) },
          login: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (root, args, context, info) => {
          var person = new UserModel(args);
          return person.save();
        }
      }
    }
  })
});

app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);

app.listen(3001, () => {
  console.log(`Listening at 3001`);
});
