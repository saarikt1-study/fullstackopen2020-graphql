const uuid = require('uuid/v1')
require('dotenv').config()
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

mongoose.set('useFindAndModify', false)

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]
    allAuthors: [Author!]
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    allBooks: (root, args) => Book.find({}),
    allAuthors: () => Author.find({}),
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments()
  },

  Book: {
    author: (root) => {
      return {
        id: root.author
      }
    }
  },

  // Author: {
  //   bookCount: (root) => {
  //     const authorsBooks = books.filter(b => b.author === root.name)
  //     return authorsBooks.length
  //   }
  // },

  Mutation: {
    addBook: async (root, args) => {
      const title = args.title
      const published = args.published
      const genres = args.genres
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }
      const book = new Book({ title, published, author, genres })
      await book.save()
      return book
    },

    editAuthor: (root, args) => {
      const authorNames = authors.map(a => a.name)
      if (!authorNames.includes(args.name)) {
        return null
      }

      authorToEdit = authors.find(a => a.name === args.name)
      authorToEdit = {
        ...authorToEdit,
        born: args.born
      }
      authors = authors.map(a => args.name === a.name ? authorToEdit : a)
      return authorToEdit
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})