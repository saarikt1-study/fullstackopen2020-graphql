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

// let authors = [
//   {
//     name: 'Robert Martin',
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: 'Martin Fowler',
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963
//   },
//   {
//     name: 'Fyodor Dostoevsky',
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821
//   },
//   { 
//     name: 'Joshua Kerievsky', // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   { 
//     name: 'Sandi Metz', // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ]

// let books = [
//   {
//     title: 'Clean Code',
//     published: 2008,
//     author: 'Robert Martin',
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Agile software development',
//     published: 2002,
//     author: 'Robert Martin',
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ['agile', 'patterns', 'design']
//   },
//   {
//     title: 'Refactoring, edition 2',
//     published: 2018,
//     author: 'Martin Fowler',
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Refactoring to patterns',
//     published: 2008,
//     author: 'Joshua Kerievsky',
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'patterns']
//   },  
//   {
//     title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//     published: 2012,
//     author: 'Sandi Metz',
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'design']
//   },
//   {
//     title: 'Crime and punishment',
//     published: 1866,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'crime']
//   },
//   {
//     title: 'The Demon ',
//     published: 1872,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'revolution']
//   },
// ]

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: String!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
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
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      born: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    allBooks: (root, args) => {
      // let newBookList = books
      // if (args.author) {
      //   newBookList = newBookList.filter(b => b.author === args.author)
      // }
      // if (args.genre) {
      //   newBookList = newBookList.filter(b => b.genres.includes(args.genre))
      // }
      // return newBookList
      return Book.find({})
    },
    allAuthors: () => Author.find({}),
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments()
  },

  Author: {
    bookCount: (root) => {
      const authorsBooks = books.filter(b => b.author === root.name)
      return authorsBooks.length
    }
  },

  Mutation: {
    addBook: async (root, args) => {
      // const authors = Author.find({})
      // console.log('Authors: ', authors)
      // if (!authors || !authors.map(a => a.name).includes(args.author)) {
      //   const newAuthor = { 
      //     name: args.author,
      //     id: uuid(),
      //     born: null
      //   }
      //   await newAuthor.save()
      // } 

      const book = new Book({
         ...args,
         id: uuid(),
        //  author: Author.findOne({ name: args.author})
      })
      await book.save()
      return book
      // const authorNames = authors.map(a => a.name)
      // if (!authorNames.includes(args.author)) {
      //   const newAuthor = { name: args.author, id: uuid() }
      //   authors = authors.concat(newAuthor)
      // }

      // const book = { ...args, id: uuid() }
      // books = books.concat(book)
      // return book
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