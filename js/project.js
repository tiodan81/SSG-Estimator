let materials = {}

var project = {
  allProjects: [],
  current: {}
}

project.getJSON = function(callback) {
  $.getJSON('/data/cisternModels.json', function(data) {
    cistern.tankModels = data
  })
  if (!Object.keys(materials).length) {
    $.getJSON('/data/materials.json', function(data) {
      materials = data
    })
  }
  callback()
}

project.maker = function(client, city, labor, mkup, owner) {
  this.client = client
  this.city = city
  this.laborRate = labor
  this.markup = mkup
  this.owner = owner
  this.rainGardens = {allRGs: [], uberRG:{}}
}

project.build = function() {
  let client = $('#project-client').val()
  let city = $('#project-city').val()
  let labor = +($('#project-labor-rate').val())
  let markup = +('1.' + $('#project-markup-rate').val())
  let owner = user.uid
  return new project.maker(client, city, labor, markup, owner)
}

project.exists = function(newProject) {
  let projectNode = fbProjects.child(newProject.client)
  projectNode.once('value', function(snapshot) {
    let exists = snapshot.exists()
    if (exists) {
      alert('Cannot save. Project with name ' + newProject.client + ' already exists.')
      return false
    } else {
      project.create(newProject)
    }
  })
}

project.create = function(newProject) {
  project.saveNew(newProject)
  user.setProjectOwner(newProject)
  project.allProjects.push(newProject)
  project.current = newProject
  viewUtil.clearForm()
  indexView.populateSelector(newProject)
  indexView.render(newProject)
}

project.saveNew = function(newProject) {
  let obj = {}
  obj[newProject.client] = newProject
  let projectString = JSON.stringify(obj)
  fbProjects.update(
    obj,
  function(error) {
    if (error) {
      console.log('Project failed to save. ' + error)
    } else {
      console.log('Saved new project ' + newProject.client)
    }
  })
}

project.updateComponent = function(cur, key) {
  let node = fbProjects.child(cur.client)
  let obj = {}
  obj[key] = cur[key]
  node.update(
    obj,
  function(error) {
    if(error) {
      console.log('Component failed to save. ' + error)
    } else {
      console.log('Saved component ' + key)
    }
  })
}

project.addOwner = function() {
  //if curUser is owner, allow to add other users as owners/viewers
}

project.populate = function(cur) {
  if (typeof(cur.cisterns) != 'undefined') {
    cistern.allCisterns = cur.cisterns.allCisterns
    cistern.uberTank = cur.cisterns.uberTank
    cistern.current = cistern.allCisterns[0]
  }
}

project.clear = function() {
  project.allProjects = []
  project.current = {}
  cistern.allCisterns = []
  cistern.current = {}
}
