const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the link as an argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
// console.log(process.argv[2], process.argv[3], process.argv[4]);

const url = `mongodb+srv://root:${password}@cluster0.iz4io7v.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected')

    if (process.argv.length >= 4) {
      const person = new Person({
        name,
        number
      })
      return person.save()
    } else {

      Person.find({}).then(result => {
        console.log('phonebook: ')
        result.forEach(note => {
          console.log(`${note.name} ${note.number}`)
        })
        mongoose.connection.close()
      })
    }
  })
  .then(() => {
    if (process.argv.length >= 4) {
      console.log(`added ${name} number ${number} to phonebook`)
      return mongoose.connection.close()
    }
  })
  .catch((err) => console.log(err))