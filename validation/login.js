const Validator = require('validator')
const isEmpty = require('./is-Empty')

module.exports = function validateLoginInput(data) {
    let errors = {}

    data.email = !isEmpty.isEmpty(data.email) ? data.email : ''
    data.password = !isEmpty.isEmpty(data.password) ? data.password : ''

    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required!'
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = 'Email is inavalid!'
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required!'
    }

    return {
        errors,
        isValid: isEmpty.isEmpty(errors)
    }
}