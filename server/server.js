// Import necessary modules
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const path = require("path");

// Set the port for the server
const PORT = process.env.PORT || 3001;

// Set up the Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  persistedQueries: false,
});

// Initiate Express app
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const startApolloServer = async (typeDefs, resolvers) => {
  // Start the Apollo server
  await server.start();

  // Apply Apollo GraphQL middleware to the Express server
  server.applyMiddleware({ app });

  // Serve static files from the React app in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));

    // Catch-all handler for GET requests
    app.get("*", (req, res) => {
      // Send the React app
      res.sendFile(path.join(__dirname, "../client/build/index.html"));
    });
  } else {
    // Catch-all handler for GET requests
    app.get("*", (req, res) => {
      // Send the React app
      res.send("<h3>Please run this app in production mode!</h3>");
    });
  }

  // Start Express server once the DB connection is open
  db.once("open", () => {
    // Start the server
    app.listen(PORT, () =>
      console.log(`🌍 Now listening on localhost:${PORT}`)
    );
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

// Call the function to start the server
startApolloServer(typeDefs, resolvers);
