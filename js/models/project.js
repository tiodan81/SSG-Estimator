const $ = require('jquery')
const user = require('./user')
const firebase = require('../firebase')
const fbProjects = firebase.child('projects')

const projectMaker = function(client, city, labor, mkup, owner) {
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

const build = function() {
  let client = $('#project-client').val()
  let city = $('#project-city').val()
  let labor = +($('#project-labor-rate').val())
  let markup = +('1.' + $('#project-markup-rate').val())
  let owner = user.uid
  return new projectMaker(client, city, labor, markup, owner)
}

const exists = function(newProject) {
  let projectNode = fbProjects.child(newProject.client)
  projectNode.once('value', function(snapshot) {
    let exists = snapshot.exists()
    if (exists) {
      alert('Cannot save. Project with name ' + newProject.client + ' already exists.')
      return false
    } else {
      saveNew(newProject)
    }
  })
}

const saveNew = function(newProject) {
  let obj = {}
  obj[newProject.client] = newProject

  fbProjects.update(
    obj,
    function(error) {
      if (error) {
        console.log('Project failed to save. ' + error)
      } else {
        console.log('Saved new project ' + newProject.client)
        exports.allProjects.push(newProject)
        exports.current = newProject
      }
    }
  )
}

const updateComponent = function(cur, key) {
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

const populate = function(cur) {
  let components = ['cisterns', 'bulkMaterials', 'rainGardens', 'rainwise']

  components.forEach((e) => {
    if (cur[e] === undefined) {
      cur[e] = { all: [], uber: {} }
    }
  })
}

const clear = function() {
  exports.allProjects = []
  exports.current = {}
}

module.exports = {
  allProjects: [],
  current: {},
  build: build,
  exists: exists,
  updateComponent: updateComponent,
  populate: populate,
  clear: clear
}
