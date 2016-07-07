let materials = {}

var project = {
  allProjects: [],
  current: {}
}

project.getJSON = function() {
  if (!Object.keys(materials).length) {
    $.getJSON('/data/materials.json', function(data) {
      materials = data
    })
  }
}

project.Maker = function(client, city, labor, mkup, owner) {
  this.client = client
  this.city = city
  this.laborRate = labor
  this.markup = mkup
  this.owner = owner
  this.rainwise = { all: [], uber: {} }
  this.rainGardens = { all: [], uber: {} }
  this.bulkMaterials = { all: [], uber: {} }
  this.cisterns = { all: [], uber: {} }
}

project.build = function() {
  let client = $('#project-client').val()
  let city = $('#project-city').val()
  let labor = +($('#project-labor-rate').val())
  let markup = +('1.' + $('#project-markup-rate').val())
  let owner = user.uid
  return new project.Maker(client, city, labor, markup, owner)
}

project.exists = function(newProject) {
  let projectNode = fbProjects.child(newProject.client)
  projectNode.once('value', function(snapshot) {
    let exists = snapshot.exists()
    if (exists) {
      alert('Cannot save. Project with name ' + newProject.client + ' already exists.')
      return false
    } else {
      project.saveNew(newProject)
    }
  })
}

project.saveNew = function(newProject) {
  let obj = {}
  obj[newProject.client] = newProject

  fbProjects.update(
    obj,
    function(error) {
      if (error) {
        console.log('Project failed to save. ' + error)
      } else {
        console.log('Saved new project ' + newProject.client)
        project.addProject(newProject)
        project.current = newProject
      }
    }
  )
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

project.addProject = function(proj) {
  project.allProjects.push(proj)
}

project.addOwner = function() {
  //if curUser is owner, allow to add other users as owners/viewers
}

project.populate = function(cur) {
  let components = ['cisterns', 'bulkMaterials', 'rainGardens', 'rainwise']

  components.forEach((e) => {
    if (cur[e] === undefined) {
      cur[e] = { all: [], uber: {} }
    }
  })
}

project.clear = function() {
  project.allProjects = []
  project.current = {}
}
