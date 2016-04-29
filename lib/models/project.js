'use strict';

var materials = {};

var project = {
  allProjects: [],
  current: {}
};

project.getJSON = function () {
  $.getJSON('/data/cisternModels.json', function (data) {
    cistern.tankModels = data;
  });
  if (!Object.keys(materials).length) {
    $.getJSON('/data/materials.json', function (data) {
      materials = data;
    });
  }
};

project.maker = function (client, city, labor, mkup, owner) {
  this.client = client;
  this.city = city;
  this.laborRate = labor;
  this.markup = mkup;
  this.owner = owner;
  this.rainwise = { all: [], uber: {} };
  this.rainGardens = { all: [], uber: {} };
  this.bulkMaterials = { all: [], uber: {} };
  this.cisterns = { all: [], uber: {} };
};

project.build = function () {
  var client = $('#project-client').val();
  var city = $('#project-city').val();
  var labor = +$('#project-labor-rate').val();
  var markup = +('1.' + $('#project-markup-rate').val());
  var owner = user.uid;
  return new project.maker(client, city, labor, markup, owner);
};

project.exists = function (newProject) {
  var projectNode = fbProjects.child(newProject.client);
  projectNode.once('value', function (snapshot) {
    var exists = snapshot.exists();
    if (exists) {
      alert('Cannot save. Project with name ' + newProject.client + ' already exists.');
      return false;
    } else {
      project.saveNew(newProject);
    }
  });
};

project.saveNew = function (newProject) {
  var obj = {};
  obj[newProject.client] = newProject;

  fbProjects.update(obj, function (error) {
    if (error) {
      console.log('Project failed to save. ' + error);
    } else {
      console.log('Saved new project ' + newProject.client);
      project.allProjects.push(newProject);
      project.current = newProject;
    }
  });
};

project.updateComponent = function (cur, key) {
  var node = fbProjects.child(cur.client);
  var obj = {};
  obj[key] = cur[key];
  node.update(obj, function (error) {
    if (error) {
      console.log('Component failed to save. ' + error);
    } else {
      console.log('Saved component ' + key);
    }
  });
};

project.populate = function (cur) {
  var components = ['cisterns', 'bulkMaterials', 'rainGardens', 'rainwise'];

  components.forEach(function (e) {
    if (cur[e] === undefined) {
      cur[e] = { all: [], uber: {} };
    }
  });
};

project.clear = function () {
  project.allProjects = [];
  project.current = {};
};
