'use strict';

var bulk = {
  current: {}
};

bulk.bulkMaker = function (i, t, wf, wi, lf, li, d) {
  this.id = i || '';
  this.type = t || '';
  this.widFt = wf || 0;
  this.widIn = wi || 0;
  this.lenFt = lf || 0;
  this.lenIn = li || 0;
  this.depth = d || 0;
  this.volume = 0;
  this.materialCost = 0;
  this.laborHrs = 0;
  this.laborCost = 0;
  this.subtotal = 0;
  this.tax = 0;
  this.total = 0;
};

bulk.build = function () {
  var $id = $('#bulk-id').val();
  var $type = $('#bulk-type').val();
  var $widFt = +$('#bulk-width-ft').val();
  var $widIn = +$('#bulk-width-in').val() || 0;
  var $lenFt = +$('#bulk-length-ft').val();
  var $lenIn = +$('#bulk-length-in').val() || 0;
  var $depth = +$('#bulk-depth').val();
  return new bulk.bulkMaker($id, $type, $widFt, $widIn, $lenFt, $lenIn, $depth);
};

bulk.calcs = function (b) {
  b.volume = util.round('ceil', (b.widFt * 12 + b.widIn) * (b.lenFt * 12 + b.lenIn) * b.depth / 46656, 0.1);
  b.materialCost = util.materialCost(b.volume, materials.bulk[b.type]);
  b.laborHrs = bulk.laborHours(b.type, b.volume);
  b.laborCost = util.laborCost(b.laborHrs);
  b.subtotal = util.round('round', b.materialCost + b.laborCost, 0.01);
  b.tax = util.salesTax(b.subtotal);
  b.total = util.round('round', b.subtotal + b.tax, 0.01);
};

bulk.laborHours = function (type, volume) {
  var onePtFive = ['topsoil', 'fillSoil', 'bioretention', 'quarterMinus', 'fiveEighthsMinus', 'fiveEighthsClean', 'drainageRock'];
  var one = ['compost', 'mulch'];
  var three = ['basalt'];
  var multiplier = void 0;

  if (type === 'soilRemoval') {
    var dumpHrs = util.round('floor', volume / 5, 1.0) * 3;
    if (dumpHrs === 0) {
      dumpHrs = 1;
    }
    return util.round('ceil', 2 * volume + dumpHrs, 0.5);
  } else if (onePtFive.indexOf(type) >= 0) {
    multiplier = 1.5;
  } else if (one.indexOf(type) >= 0) {
    multiplier = 1;
  } else if (three.indexOf(type) >= 0) {
    multiplier = 3;
  } else {
    return new Error('type not found');
  }

  return util.round('ceil', volume * multiplier, 0.5);
};

bulk.saveToProject = function (b) {
  if (user.uid && project.current.client) {
    bulk.storeLocally(b);
    project.current.bulkMaterials.uber = bulk.makeUber(project.current.bulkMaterials.all);
    project.updateComponent(project.current, 'bulkMaterials');
  } else {
    return new Error('Either you\'re not signed in or haven\'t initiated a project!');
  }
};

bulk.storeLocally = function (b) {
  var all = project.current.bulkMaterials.all;
  var $exists = util.findObjInArray(b.id, all, 'id');

  if ($exists.length) {
    all.forEach(function (c, i) {
      if (b.id === c.id) {
        all[i] = b;
      }
    });
  } else {
    all.push(b);
  }
  bulk.current = b;
};

bulk.makeUber = function (all) {
  var uber = {};
  var totals = {
    volume: 0,
    hours: 0

  };
  var strippedAll = void 0;

  if (!all.length) {
    return {};
  }

  strippedAll = util.objectStripper(all, ['type', 'volume']);

  strippedAll.forEach(function (e) {
    if (!uber.hasOwnProperty(e.type)) {
      uber[e.type] = {
        volume: e.volume,
        materialCost: 0,
        hours: 0,
        laborCost: 0,
        subtotal: 0,
        tax: 0,
        total: 0
      };
    } else if (uber.hasOwnProperty(e.type)) {
      uber[e.type].volume += e.volume;
    }
  });

  for (var prop in uber) {
    uber[prop].volume = util.round('ceil', uber[prop].volume, 0.5);
    uber[prop].materialCost = util.materialCost(uber[prop].volume, materials.bulk[prop]);
    uber[prop].hours = bulk.laborHours(prop, uber[prop].volume);
    uber[prop].laborCost = util.laborCost(uber[prop].hours);
    uber[prop].subtotal = util.round('round', uber[prop].materialCost + uber[prop].laborCost, 0.01);
    uber[prop].tax = util.salesTax(uber[prop].subtotal);
    uber[prop].total = util.round('round', uber[prop].subtotal + uber[prop].tax, 0.01);
  }

  return uber;
};

bulk.preventDuplicates = function () {
  var $id = $('#bulk-id').val();
  var $exists = util.findObjInArray($id, project.current.bulkMaterials.all, 'id').length;
  if ($exists) {
    return true;
  } else {
    return false;
  }
};