var loginView = {};

loginView.init = function() {
  $('#login-content').show()
    .siblings().hide();
  loginView.showLoginNav();
  loginView.handleCreate();
  loginView.handleLogin();
};

loginView.handleCreate = function() {
  $('#new-user-form').off('submit').on('submit', function(e) {
    e.preventDefault();
    let email = $('#new-user').val();
    let pwd = $('#new-password').val();
    user.create(email, pwd);
    $('#new-user, #new-password').val('');
  });
};

loginView.handleLogin = function() {
  $('#login-form').off('submit').on('submit', function(e) {
    e.preventDefault();
    user.email = $('#username').val();
    let pwd = $('#password').val();
    user.authenticate(pwd);
    loginView.showLogoutNav();
    $('#username, #password').val('');
  });
};

loginView.showLoginNav = function() {
  $('#login-nav').text('Login').removeClass('logout').addClass('login');
  $('.login').on('click', loginView.init);
};

loginView.showLogoutNav = function() {
  $('#login-nav').text('Logout').removeClass('login').addClass('logout');
  $('.logout').on('click', controller.logout);
};

var indexView = {};

indexView.init = function () {
  $('#home-content').show()
    .siblings().hide();
  // if (Object.keys(project.current).length) {
  //   indexView.render(project.current);
  // }
  indexView.handleCreateButton();
  indexView.handleSelector();
};

indexView.handleCreateButton = function() {
  $('#project-create-button').off('click').on('click', function(e) {
    e.preventDefault();
    $('#project-select-container').hide();
    $('#projectForm').show();
    indexView.handleProjectForm();
  });
};

indexView.handleProjectForm = function() {
  $('#projectForm').off('submit').on('submit', function(e) {
    e.preventDefault();
    let newProject = project.build();
    project.exists(newProject);
  });
};

indexView.render = function(project) {
  $('#projectForm').hide()
    .siblings().show();
  $('#project-selector').val(project.client);
  $('#project-summary').html(indexView.makeTable(project));
};

indexView.populateSelector = function(project) {
  let client = project.client;
  if($('#project-selector option[value="' + client + '"]').length === 0) {
    let option = '<option value="' + client + '">' + client + '</option>';
    $('#project-selector').append(option);
  }
};

indexView.handleSelector = function() {
  $('#project-selector').off('change').on('change', function() {
    let id = $(this).val();
    if (id === 'default') {
      return;
    } else {
      let curProject = util.findObjInArray(id, project.allProjects, 'client');
      project.current = curProject[0];
      project.populate(project.current);
      indexView.render(project.current);
    }
  });
};

indexView.makeTable = function(cur) {
  let html = '';
  html += `
  <h2>${cur.client}</h2>
  <table id="project-table">
  <tr><th>Item</th><th>Labor Hours</th><th>Labor Cost</th><th>Materials Cost</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr>
  `;
  if (cur.cisterns) {
    let cisterns = cur.cisterns.uberTank;
    html += `<tr><td>Cisterns</td><td>${cisterns.totalHr}</td><td>${cisterns.laborTotal}</td><td>${cisterns.materialsTotal}</td><td>${cisterns.subtotal}</td><td>${cisterns.tax}</td><td>${cisterns.total}</td></tr>`;
  }
  html +=`
  <tr><td>Mulch</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>Total</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  </table>
  `;
  return html;
};

indexView.updateProjectSummary = function() {

};

var rainwiseView = {};

rainwiseView.init = function() {
  $('#rainwise-content').show()
    .siblings().hide();

};

// rainwiseView.handleSave = function() {
//   $('#rainwise-update').on('click')
// };

var mulchView = {};

mulchView.init = function() {
  $('#mulch-content').show()
    .siblings().hide();
  mulchView.handleNew();
  //mulchView.handleUpdate();
  mulchView.showTotal();
};

mulchView.makeTable = function() {
  $('#mulch-table-body').empty();
  mulch.mulchZones.forEach(function(zone) {
    var html = '';
    html += `
    <tr>
    <td class="zone">${zone.zone}</td>
    <td class="type">${zone.type}</td>
    <td class="width">${zone.dispWidth}</td>
    <td class="length">${zone.dispLength}</td>
    <td class="depth">${zone.depth}"</td>
    <td class="volume">${zone.volume} yd</td>
    <td class="price">$${zone.price}</td>
    <td><span id="${zone.id}" class="icon-pencil2"></span></td>
    <td><span id="${zone.id}" class="icon-bin2"></span></td>
    </tr>
    `;
    $('#mulch-table-body').append(html);
  });
};

mulchView.showTotal = function() {
  if (mulch.mulchZones.length === 0) {
    $('#mulch-totalrow').hide();
    $('#save-mulch').hide();
  } else {
    $('#mulch-totalrow').show();
    $('#save-mulch').show();
  }
};

mulchView.editZone = function() {
  $('#mulch-table-body .icon-pencil2').off('click').on('click', function() {
    var curId = $(this).attr('id');
    mulch.mulchZones.forEach(function(zone) {
      if (zone.id === parseInt(curId)) {
        mulchView.populateForm(zone);
        $('mulch-save').val('update').data('id', curId);
        //$('#mulch-update').show().data('id', curId);
      }
    });
  });
};

mulchView.populateForm = function(zone) {
  $('#zone').val(zone.zone);
  $('#width-ft').val(zone.widFt);
  $('#width-in').val(zone.widIn);
  $('#length-ft').val(zone.lenFt);
  $('#length-in').val(zone.lenIn);
  $('#depth').val(zone.depth);
};

mulchView.handleNew = function() {
  $('#mulchForm').off('submit').on('submit', function(e) {
    e.preventDefault();
    let $val = $('#mulch-save').val();
    if ($val === 'save') {
      let newMulchZone = mulch.buildMulch(mulch.zoneId);
      mulch.mulchZones.push(newMulchZone);
      mulch.zoneId += 1;
      mulch.listen();
      viewUtil.clearForm();
    } else if ($val === 'update') {
      let curId = parseInt($(this).data('id'));
      let updated = mulch.buildMulch(curId);
      mulch.findReplace(updated);
      mulch.listen();
      viewUtil.clearForm();
      $val = 'save';
    } else {
      console.log('error: no mulch match.');
    }
  });
};

// mulchView.handleUpdate = function() {
//   $('#mulch-update').off('submit').on('submit', function(e) {
//     e.preventDefault();
//     var curId = parseInt($(this).data('id'));
//     var updated = mulch.buildMulch(curId);
//     mulch.findReplace(updated);
//     mulch.listen();
//     viewUtil.clearForm();
//     $('#mulch-update').hide();
//     $('#mulch-add').show();
//   });
// };

mulchView.deleteZone = function() {
  $('#mulch-table-body .icon-bin2').off('click').on('click', function(e) {
    e.preventDefault();
    var curId = parseInt($(this).attr('id'));
    mulch.mulchZones.forEach(function(zone, i) {
      if (zone.id === curId) {
        mulch.mulchZones.splice(i, 1);
      }
    });
    mulch.listen();
  });
};

var cisternView = {};

cisternView.init = function() {
  $('#cistern-content').show()
    .siblings().hide();
  cisternView.displayExisting();
  cisternView.handleNew();
  //cisternView.handleAddOns();
  cisternView.handleSelector();
  cisternView.handleNav();
  cisternView.handleUpdate();
  cisternView.handleDelete();
};

cisternView.displayExisting = function() {
  let $display = $('#cistern-display');
  if (cistern.allCisterns.length) {
    $('#cistern-selector').empty();
    cistern.allCisterns.forEach(function(e) {
      cisternView.populateSelector(e);
    });
    cisternView.populateSelector(cistern.uberTank);
    cisternView.renderNew(cistern.current);
  } else {
    return;
  }
};

cisternView.handleAddOns = function() {
  $('#cisternAddOns').on('change', function() {
    let addOn = $(this).val();
    let count = $("'#" + addOn + "'").data('count');
    count = count != 0 ? count : 1;
    //let count = $("'#" + addOn + "'").length ? cisternView.getAddOnCount(addOn) + 1 : 1;
    $(this).parent().after(cisternView.makeAddOn(addOn, count));
  });
};

cisternView.getAddOnCount = function(a) {
  return $("'#" + a + "'").data('count');
};

cisternView.makeAddOn = function(addOn, count) {
  let html = '';
  html += `<div class="fe">
  <label id="${addOn}" data-count="${count} class="fieldname">${count} -</label>
  <p>${addOn}</p>
  `;
  return html;
};

cisternView.handleNew = function() {
  $('#cistern-add').off('click').on('click', function(e) {
    e.preventDefault();
    let newCistern = cistern.buildCistern();
    cistern.allCalcs(newCistern);
    cistern.allCisterns.push(newCistern);
    cisternView.renderNew(newCistern);
    cistern.updateUberTank();
    cistern.saveToProject();
    cistern.current = newCistern;
    viewUtil.clearForm();
  });
};

cisternView.renderNew = function(cur) {
  const $display = $('#cistern-display');
  cisternView.populateSelector(cur);
  $('#cistern-selector').val(cur.cisternId);
  cisternView.makeTables(cur);
  if ($display.css('display') === 'none') {
    $display.show();
  }
  cisternView.showSummary();
  cisternView.editButtons();
};

cisternView.populateSelector = function(cur) {
  let curId = cur.cisternId;
  if ($('#cistern-selector option[value="' + curId + '"]').length === 0) {
    let option = '<option value="' + curId + '">' + curId + '</option>';
    $('#cistern-selector').append(option);
  }
};

cisternView.showSummary = function() {
  let $selected = $('.button-primary').attr('id').split('-')[2];
  if ($selected != 'summary') {
    $('#cistern-nav-summary').addClass('button-primary')
      .siblings().removeClass('button-primary');
    $('#cistern-table-summary').show()
      .siblings().hide();
  }
};

cisternView.handleSelector = function() {
  $('#cistern-selector').off('change').on('change', function() {
    let id = $('#cistern-selector').val();
    if (id === 'All tanks') {
      cisternView.makeTables(cistern.uberTank);
      $('#cistern-edit-buttons').hide();
    } else {
      let curCistern = util.findObjInArray(id, cistern.allCisterns, 'cisternId');
      cisternView.makeTables(curCistern[0]);
      cistern.current = curCistern[0];
      $('#cistern-edit-buttons').show();
    }
    cisternView.showSummary();
  });
};

cisternView.handleNav = function() {
  $('#cistern-nav > button').off('click').on('click', function() {
    let $curNav = $('.button-primary').attr('id').split('-')[2];
    let $nextNav = $(this).attr('id').split('-')[2];
    $(this).addClass('button-primary')
      .siblings().removeClass('button-primary');
    if ($curNav != $nextNav) {
      let target = '#cistern-table-' + $nextNav;
      $(target).show()
        .siblings().hide();
    } else {
      return;
    }
  });
};

cisternView.makeTables = function(cur) {
  $('#cistern-table-summary').html(cisternView.makeSummary(cur));
  $('#cistern-table-labor').html(cisternView.makeLabor(cur));
  $('#cistern-table-materials').html(cisternView.makeMaterials(cur));
};

cisternView.makeSummary = function(cur) {
  let summary = '';
  summary += `
  <tr><th>Item</th><th>Cost</th></tr>
  <tr><td>Model</td><td>${cur.model}</td></tr>
  <tr><td>Roof area</td><td>${cur.roofArea} ft²</td></tr>
  <tr><td>Labor hours</td><td>${cur.totalHr}</td></tr>
  <tr><td>Labor cost</td><td>$${cur.laborTotal}</td></tr>
  <tr><td>Materials cost</td><td>$${cur.materialsTotal}</td></tr>
  <tr><td>Tax</td><td>$${cur.tax}</td></tr>
  <tr><td>Total</td><td>$${cur.total}</td></tr>
  `;
  return summary;
};

cisternView.makeLabor = function(cur) {
  let labor = '';
  labor += `
  <tr><th>Item</th><th>Hours</th><th>Cost</th></tr>
  <tr><td>Base</td><td>${cur.baseLaborHr}</td><td>$${cur.baseLaborCost}</td></tr>
  <tr><td>Inflow</td><td>${cur.inflowLaborHr}</td><td>$${cur.inflowLaborCost}</td></tr>
  <tr><td>Outflow</td><td>${cur.outflowLaborHr}</td><td>$${cur.outflowLaborCost}</td></tr>
  `;
  if (cur.additionalLaborHr) {
    labor += `<tr><td>Additional</td><td>${cur.additionalLaborHr}</td><td>$${cur.additionalLaborCost}</td></tr>`;
  }
  labor += `<tr><td>Total</td><td>${cur.totalHr}</td><td>$${cur.laborTotal}</td></tr>`;
  return labor;
};

cisternView.makeMaterials = function(cur) {
  let materials = '';
  materials += `
  <tr><th>Item</th><th>Qty</th><th>Cost</th></tr>
  <tr><td>Tank</td><td>1</td><td>$${cur.salePrice}</td></tr>
  <tr><td>Gutter</td><td>${cur.gutter}ft</td><td>$${cur.gutterCost}</td></tr>
  <tr><td>Paverbase</td><td>${cur.paverbase}yd</td><td>$${cur.paverbaseCost}</td></tr>
  `;
  if (cur.manorStones != 0) {
    materials += `<tr><td>Manor stones</td><td>${cur.manorStones}</td><td>$${cur.manorStoneCost}</td></tr>`;
  }
  if (cur.cinderBlocks != 0) {
    materials += `<tr><td>Cinder blocks</td><td>${cur.cinderBlocks}</td><td>$${cur.cinderBlockCost}</td></tr>`;
  }
  materials += `
  <tr><td>Inflow pipe</td><td>${cur.inflow}ft</td><td>$${cur.inflowPipeCost}</td></tr>
  <tr><td>Inflow hardware</td><td>${cur.inflowHardware}</td><td>$${cur.inflowHdwCost}</td></tr>
  <tr><td>Outflow pipe</td><td>${cur.outflow}ft</td><td>$${cur.outflowPipeCost}</td></tr>
  <tr><td>Outflow hardware</td><td>${cur.outflowHardware}</td><td>$${cur.outflowHdwCost}</td></tr>
  `;
  if (cur.slimlineRestraints) {
    materials += `<tr><td>Slimeline restraints</td><td>1</td><td>$${cur.slimlineRestraints}</td></tr>`;
  }
  if (cur.bulkheadKit) {
    materials += `<tr><td>Bulkhead kit</td><td>1</td><td>$${cur.bulkheadKit}</td></tr>`;
  }
  materials += `
  <tr><td>Low-flow kit</td><td>1</td><td>$75.00</td></tr>
  <tr><td>Total</td><td></td><td>$${cur.materialsTotal}</td></tr>
  `;
  return materials;
};

cisternView.editButtons = function() {
  let buttons = '';
  buttons += `
  <span class="icon-pencil2"></span>
  <span class="icon-bin2"></span>
  `;
  $('#cistern-edit-buttons').empty().html(buttons);
  cisternView.handleEdit();
  cisternView.handleDelete();
};

cisternView.handleEdit = function() {
  $('#cistern-edit-buttons .icon-pencil2').off('click').on('click', function(e) {
    e.preventDefault();
    let cur = cistern.current;
    cisternView.populateForm(cur);
    $('#cistern-add').hide();
    $('#cistern-update').show();
  });
};

cisternView.handleUpdate = function() {
  $('#cistern-update').off('click').on('click', function(e) {
    e.preventDefault();
    let old = cistern.current;
    let updated = cistern.buildCistern();
    cistern.allCalcs(updated);
    cistern.allCisterns.forEach(function(c, i) {
      if (updated.cisternId === c.cisternId) {
        cistern.allCisterns[i] = updated;
      }
    });
    cistern.updateUberTank();
    cisternView.renderNew(updated);
    cistern.current = updated;
    cistern.saveToProject();
    viewUtil.clearForm();
    $('#cistern-update').hide();
    $('#cistern-add').show();
  });
};

cisternView.handleDelete = function() {
  $('#cistern-edit-buttons .icon-bin2').off('click').on('click', function(e) {
    e.preventDefault();
    let old = cistern.current;
    let all = cistern.allCisterns;
    all.forEach(function(e, i) {
      if (e.cisternId === old.cisternId) {
        all.splice(i, 1);
      }
    });
    $('#cistern-selector > option[value="' + old.cisternId + '"]').remove();
    cistern.updateUberTank();
    cistern.saveToProject();
    if (all.length) {
      cistern.current = all[0];
      let cur = cistern.current;
      $('#cistern-selector').val(cur.cisternId);
      cisternView.makeTables(cur);
      cisternView.showSummary();
      cisternView.editButtons();
    } else {
      cistern.current = {};
      $('#cistern-display').hide();
    };
  });
};

cisternView.populateForm = function(cur) {
  $('#cistern').val(cur.cisternId);
  $('#roofArea').val(cur.roofArea);
  $('#cisternModel').val(cur.model);
  $('#cisternBase').val(cur.baseHeight);
  $('#gutterFt').val(cur.gutter);
  $('#cisternInflow').val(cur.inflow);
  $('#cisternOutflow').val(cur.outflow);
  $('#cisternAddLabor').val(cur.additionalLaborHr);
};

var viewUtil = {};

viewUtil.clear = function(callback) {
  $('#logout').hide();
  $('#login').show();
  $('#project-selector').html('<option value="default">Select a Project</option>');
  $('#project-summary').html('');
  //clear mulch table
  $('#cistern-selector').html('');
  $('#cistern-display').hide();
  viewUtil.clearForm();
  callback();
};

viewUtil.clearForm = function() {
  $('.fe input').val('');
};

$(function() {
  controller.checkLogin();
});
