var project = {
  allProjects: [],
  current: {}
};

project.maker = function(client, city, labor, mkup, owner) {
  this.client = client;
  this.city = city;
  this.laborRate = labor;
  this.markup = mkup;
  this.owner = owner;
};

var materials = {};

project.build = function() {
  let client = $('#project-client').val();
  let city = $('#project-city').val();
  let labor = +($('#project-labor-rate').val());
  let markup = +('1.' + $('#project-markup-rate').val());
  let owner = user.uid;
  return new project.maker(client, city, labor, markup, owner);
};

project.create = function(newProject) {
  project.saveNew(newProject);
  user.setProjectOwner(newProject);
};

project.saveNew = function(newProject) {
  //don't allow set if fbProjects/client already exists!
  let obj = {};
  obj[newProject.client] = newProject;
  let projectString = JSON.stringify(obj);
  fbProjects.set(
    obj,
  function(error) {
    if (error) {
      console.log('Project failed to save.' + error);
    } else {
      console.log('Saved new project ' + newProject.client);
    }
  });
};

project.updateComponent = function(cur, key) {
  let node = fbProjects.child(cur.client);
  let obj = {};
  obj[key] = cur[key];
  node.update(
    obj,
  function(error) {
    if(error) {
      console.log('Component failed to save.' + error);
    } else {
      console.log('Saved component' + key);
    }
  });
};

project.addOwner = function() {
  //if curUser is owner, allow to add other users as owners/viewers
};
