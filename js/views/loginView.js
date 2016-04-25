const $ = require('jquery')
const user = require('../models/user')
const userController = require('../controllers/userController')

const init = function() {
  $('#login-content').show()
    .siblings().hide()
  showLoginNav()
  handleCreate()
  handleLogin()
}

const handleCreate = function() {
  $('#new-user-form').off('submit').on('submit', function(e) {
    e.preventDefault()
    let email = $('#new-user').val()
    let pwd = $('#new-password').val()
    user.create(email, pwd)
    $('#new-user, #new-password').val('')
  })
}

const handleLogin = function() {
  $('#login-form').off('submit').on('submit', function(e) {
    e.preventDefault()
    user.email = $('#username').val()
    let pwd = $('#password').val()
    user.authenticate(pwd)
    showLogoutNav()
    $('#username, #password').val('')
  })
}

const showLoginNav = function() {
  $('#login-nav').text('Login')
    .removeClass('logout').addClass('login')
  $('#main-nav li:last').siblings().hide()
  $('.login').on('click', init)
}

const showLogoutNav = function() {
  $('#login-nav').text('Logout')
    .removeClass('login').addClass('logout')
  $('#main-nav li').show()
  $('.logout').on('click', userController.logout)
}

module.exports = {
  init: init,
  showLogoutNav: showLogoutNav
}
