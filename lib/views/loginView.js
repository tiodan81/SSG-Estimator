'use strict';

var loginView = {};

loginView.init = function () {
  $('#login-content').show().siblings().hide();
  loginView.showLoginNav();
  loginView.handleCreate();
  loginView.handleLogin();
};

loginView.handleCreate = function () {
  $('#new-user-form').off('submit').on('submit', function (e) {
    e.preventDefault();
    var email = $('#new-user').val();
    var pwd = $('#new-password').val();
    user.create(email, pwd);
    $('#new-user, #new-password').val('');
  });
};

loginView.handleLogin = function () {
  $('#login-form').off('submit').on('submit', function (e) {
    e.preventDefault();
    user.email = $('#username').val();
    var pwd = $('#password').val();
    user.authenticate(pwd);
    loginView.showLogoutNav();
    $('#username, #password').val('');
  });
};

loginView.showLoginNav = function () {
  $('#login-nav').text('Login').removeClass('logout').addClass('login');
  $('#main-nav li:last').siblings().hide();
  $('.login').on('click', loginView.init);
};

loginView.showLogoutNav = function () {
  $('#login-nav').text('Logout').removeClass('login').addClass('logout');
  $('#main-nav li').show();
  $('.logout').on('click', userController.logout);
};